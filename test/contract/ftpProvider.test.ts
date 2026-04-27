import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AbortError,
  AuthenticationError,
  ProtocolError,
  createFtpProviderFactory,
  createTransferClient,
  type ConnectionProfile,
} from "../../src/index";
import { FakeFtpServer } from "../servers/FakeFtpServer";
import { describeProviderContract } from "./providerContract";

const reportFact =
  "type=file;size=14;modify=20260427010203;perm=adfr;unique=file:report; report.csv";

let server: FakeFtpServer;
const profile: ConnectionProfile = {
  host: "127.0.0.1",
  password: { value: "secret" },
  port: 0,
  provider: "ftp",
  username: { value: "tester" },
};

beforeEach(async () => {
  server = createContractFtpServer();
  const port = await server.start();
  profile.port = port;
});

afterEach(async () => {
  await server.stop();
});

describeProviderContract("ftp", {
  createProviderFactory: () => createFtpProviderFactory(),
  expectedCapabilities: {
    authentication: ["anonymous", "password"],
    list: true,
    provider: "ftp",
    stat: true,
  },
  expectedListPaths: ["/incoming/report.csv"],
  expectedStat: {
    name: "report.csv",
    path: "/incoming/report.csv",
    permissions: { raw: "adfr" },
    size: 14,
    type: "file",
    uniqueId: "file:report",
  },
  listPath: "/incoming",
  missingPath: "/incoming/missing.csv",
  profile,
  statPath: "/incoming/report.csv",
});

describe("createFtpProviderFactory", () => {
  it("uses factory default ports and optional connection controls", async () => {
    const port = requireProfilePort();
    const abortController = new AbortController();
    const client = createTransferClient({
      providers: [createFtpProviderFactory({ defaultPort: port })],
    });
    const session = await client.connect({
      host: "127.0.0.1",
      password: "secret",
      provider: "ftp",
      signal: abortController.signal,
      timeoutMs: 1_000,
      username: "tester",
    });

    await session.disconnect();
    await session.disconnect();

    expect(server.commands).toEqual(["USER tester", "PASS secret", "QUIT"]);
  });

  it("uses anonymous credentials when none are provided", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER anonymous") return "230 Anonymous login ok\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect({ host: "127.0.0.1", port, provider: "ftp" });

    await session.disconnect();

    expect(server.commands).toEqual(["USER anonymous", "QUIT"]);
  });

  it("raises typed authentication errors for rejected credentials", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "530 Login incorrect\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });

    await expect(
      client.connect({
        host: "127.0.0.1",
        password: "secret",
        port,
        provider: "ftp",
        username: "tester",
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("raises typed authentication errors when USER is rejected", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "530 Login incorrect\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });

    await expect(
      client.connect({ host: "127.0.0.1", port, provider: "ftp", username: "tester" }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("raises typed protocol errors for unsuccessful greetings", async () => {
    await server.stop();
    server = new FakeFtpServer({ greeting: "421 Service unavailable\r\n" });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });

    await expect(
      client.connect({ host: "127.0.0.1", port, provider: "ftp" }),
    ).rejects.toBeInstanceOf(ProtocolError);
  });

  it("raises typed abort errors for pre-aborted connection attempts", async () => {
    const abortController = new AbortController();
    abortController.abort();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });

    await expect(
      client.connect({
        host: "127.0.0.1",
        port: requireProfilePort(),
        provider: "ftp",
        signal: abortController.signal,
      }),
    ).rejects.toBeInstanceOf(AbortError);
  });

  it("raises typed protocol errors for malformed passive responses", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "PASV") return "227 Missing tuple\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect({
      host: "127.0.0.1",
      password: "secret",
      port,
      provider: "ftp",
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(ProtocolError);
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed protocol errors for invalid passive response tuples", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "PASV") return "227 Entering Passive Mode (999,0,0,1,1,2)\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect({
      host: "127.0.0.1",
      password: "secret",
      port,
      provider: "ftp",
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(ProtocolError);
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed protocol errors for failed setup and malformed data replies", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "500 Type failed\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect({
      host: "127.0.0.1",
      password: "secret",
      port,
      provider: "ftp",
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(ProtocolError);
    } finally {
      await session.disconnect();
    }

    await server.stop();
    server = new FakeFtpServer({
      passiveData: () => undefined,
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "MLSD /incoming") return "226 Transfer complete\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const malformedDataPort = await server.start();
    const malformedDataSession = await client.connect({
      host: "127.0.0.1",
      password: "secret",
      port: malformedDataPort,
      provider: "ftp",
      username: "tester",
    });

    try {
      await expect(malformedDataSession.fs.list("/incoming")).rejects.toBeInstanceOf(ProtocolError);
    } finally {
      await malformedDataSession.disconnect();
    }
  });
});

function createContractFtpServer(): FakeFtpServer {
  return new FakeFtpServer({
    passiveData(command) {
      if (command === "MLSD /incoming") {
        return `${reportFact}\r\n`;
      }

      return undefined;
    },
    responder(command) {
      if (command === "USER tester") return "331 Password required\r\n";
      if (command === "PASS secret") return "230 Logged in\r\n";
      if (command === "TYPE I") return "200 Type set\r\n";
      if (command === "MLST /incoming/report.csv") {
        return ["250-Listing\r\n", ` ${reportFact}\r\n`, "250 End\r\n"];
      }
      if (command.startsWith("MLST ") || command.startsWith("MLSD ")) {
        return "550 Path not found\r\n";
      }
      if (command === "QUIT") return "221 Bye\r\n";
      return "502 Unexpected command\r\n";
    },
  });
}

function requireProfilePort(): number {
  if (profile.port === undefined) {
    throw new Error("Expected FTP test profile port");
  }

  return profile.port;
}
