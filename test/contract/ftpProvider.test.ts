import { Buffer } from "node:buffer";
import { createServer } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AbortError,
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  ProtocolError,
  TimeoutError,
  TransferEngine,
  createProgressEvent,
  createProviderTransferExecutor,
  createFtpProviderFactory,
  createTransferClient,
  type ConnectionProfile,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferSession,
  type TransferVerificationResult,
} from "../../src/index";
import { FakeFtpServer } from "../servers/FakeFtpServer";
import { describeProviderContract } from "./providerContract";

const reportFact =
  "type=file;size=14;modify=20260427010203;perm=adfr;unique=file:report; report.csv";
const reportContent = "id,name\n1,Ada\n";

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
    readStream: true,
    resumeDownload: true,
    resumeUpload: true,
    stat: true,
    writeStream: true,
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
  it("exposes FTP read, write, resume, and provider-executor transfer operations", async () => {
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect(profile);
    const copySession = await client.connect(profile);
    const transfers = requireTransfers(session);

    try {
      const rangeRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { length: 4, offset: 3 }),
      );
      const rangeText = await readText(rangeRead.content);
      const verification: TransferVerificationResult = {
        actualChecksum: "sha256:source",
        checksum: "sha256:source",
        details: { side: "source" },
        expectedChecksum: "sha256:source",
        method: "checksum",
        verified: true,
      };
      const writeResult = await transfers.write(
        createWriteRequest("/out/upload.txt", createTextContent("hello", 2), {
          totalBytes: 5,
          verification,
        }),
      );
      const executor = createProviderTransferExecutor({
        resolveSession: ({ endpoint, role }) => {
          if (endpoint.provider !== "ftp") {
            return undefined;
          }

          return role === "source" ? session : copySession;
        },
      });
      const receipt = await new TransferEngine().execute(
        {
          destination: { path: "/out/copy.csv", provider: "ftp" },
          id: "ftp-provider-copy",
          operation: "copy",
          source: { path: "/incoming/report.csv", provider: "ftp" },
        },
        executor,
      );
      const resumedWriteResult = await transfers.write(
        createWriteRequest("/out/upload.txt", createTextContent("!!"), {
          offset: 5,
          totalBytes: 7,
        }),
      );

      expect(rangeRead).toMatchObject({ bytesRead: 3, totalBytes: 4 });
      expect(rangeText).toBe("name");
      expect(writeResult).toMatchObject({
        bytesTransferred: 5,
        resumed: false,
        totalBytes: 5,
        verification,
        verified: true,
      });
      expect(resumedWriteResult).toMatchObject({
        bytesTransferred: 2,
        resumed: true,
        totalBytes: 7,
      });
      expect(receipt).toMatchObject({
        bytesTransferred: reportContent.length,
        destination: { path: "/out/copy.csv", provider: "ftp" },
        source: { path: "/incoming/report.csv", provider: "ftp" },
        totalBytes: reportContent.length,
      });
      expect(server.commands).toContain("EPSV");
      expect(server.commands).toContain("REST 3");
      expect(server.commands).toContain("REST 5");
      expect(
        server.uploads.map((upload) => [upload.command, upload.content.toString("utf8")]),
      ).toEqual([
        ["STOR /out/upload.txt", "hello"],
        ["STOR /out/copy.csv", reportContent],
        ["STOR /out/upload.txt", "!!"],
      ]);
    } finally {
      await session.disconnect();
      await copySession.disconnect();
    }
  });

  it("falls back from EPSV to loosely formatted PASV responses", async () => {
    await server.stop();
    server = new FakeFtpServer({
      extendedPassive: false,
      passiveData(command) {
        if (command === "MLSD /incoming") {
          return `${reportFact}\r\n`;
        }

        return undefined;
      },
      passiveResponse(port) {
        const highByte = Math.floor(port / 256);
        const lowByte = port % 256;
        return `227 Passive address: 127,0,0,1,${highByte},${lowByte}\r\n`;
      },
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "EPSV") return "502 EPSV not implemented\r\n";
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
      const entries = await session.fs.list("/incoming");

      expect(entries.map((entry) => entry.path)).toEqual(["/incoming/report.csv"]);
      expect(server.commands).toContain("EPSV");
      expect(server.commands).toContain("PASV");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed protocol errors for malformed EPSV responses", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "EPSV") return "229 Entering Extended Passive Mode (|||not-a-port|)\r\n";
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
      expect(server.commands).not.toContain("PASV");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed transfer errors for invalid offsets and failed restart commands", async () => {
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    let session = await client.connect(profile);
    let transfers = requireTransfers(session);

    try {
      await expect(
        transfers.read(createReadRequest("/incoming/report.csv", { offset: -1 })),
      ).rejects.toBeInstanceOf(ConfigurationError);
      await expect(
        transfers.write(
          createWriteRequest("/out/upload.txt", createTextContent("nope"), { offset: -1 }),
        ),
      ).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }

    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "REST 1") return "500 Restart failed\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    session = await client.connect({
      host: "127.0.0.1",
      password: "secret",
      port,
      provider: "ftp",
      username: "tester",
    });
    transfers = requireTransfers(session);

    try {
      await expect(
        transfers.read(createReadRequest("/incoming/report.csv", { offset: 1 })),
      ).rejects.toBeInstanceOf(ProtocolError);
    } finally {
      await session.disconnect();
    }
  });

  it("normalizes root and relative paths for FTP metadata commands", async () => {
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect(profile);

    try {
      const rootEntries = await session.fs.list(".");
      const relativeStat = await session.fs.stat("incoming/report.csv");
      const rootStat = await session.fs.stat("/");

      expect(rootEntries.map((entry) => entry.path)).toEqual(["/report.csv"]);
      expect(relativeStat.path).toBe("/incoming/report.csv");
      expect(rootStat).toMatchObject({ path: "/", type: "directory" });
      expect(server.commands).toContain("MLSD /");
      expect(server.commands).toContain("MLST /incoming/report.csv");
      expect(server.commands).toContain("MLST /");
    } finally {
      await session.disconnect();
    }
  });

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

  it("accepts Buffer credential sources", async () => {
    const client = createTransferClient({ providers: [createFtpProviderFactory()] });
    const session = await client.connect({
      host: "127.0.0.1",
      password: Buffer.from("secret"),
      port: requireProfilePort(),
      provider: "ftp",
      username: Buffer.from("tester"),
    });

    await session.disconnect();

    expect(server.commands).toEqual(["USER tester", "PASS secret", "QUIT"]);
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

  it("raises typed timeout errors for stalled FTP command responses", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return undefined;
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
      timeoutMs: 25,
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(TimeoutError);
      expect(server.commands).toContain("TYPE I");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed timeout errors for stalled FTP transfer completion replies", async () => {
    await server.stop();
    server = new FakeFtpServer({
      passiveData(command) {
        if (command === "MLSD /incoming") {
          return `${reportFact}\r\n`;
        }

        return undefined;
      },
      passiveFinalResponse: null,
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
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
      timeoutMs: 25,
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(TimeoutError);
      expect(server.commands).toContain("MLSD /incoming");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed timeout errors for stalled FTP passive data sockets", async () => {
    await server.stop();
    server = new FakeFtpServer({
      passiveData(command) {
        if (command === "MLSD /incoming") {
          return null;
        }

        return undefined;
      },
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
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
      timeoutMs: 25,
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(TimeoutError);
      expect(server.commands).toContain("MLSD /incoming");
    } finally {
      await session.disconnect();
    }
  });

  it("raises typed connection errors for unreachable passive data endpoints", async () => {
    const unreachablePort = await findUnusedPort();
    await server.stop();
    server = new FakeFtpServer({
      extendedPassive: false,
      passiveData: () => "unreachable data\r\n",
      passiveResponse() {
        const highByte = Math.floor(unreachablePort / 256);
        const lowByte = unreachablePort % 256;
        return `227 Entering Passive Mode (127,0,0,1,${highByte},${lowByte})\r\n`;
      },
      responder(command) {
        if (command === "USER tester") return "331 Password required\r\n";
        if (command === "PASS secret") return "230 Logged in\r\n";
        if (command === "TYPE I") return "200 Type set\r\n";
        if (command === "EPSV") return "502 EPSV not implemented\r\n";
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
      timeoutMs: 1_000,
      username: "tester",
    });

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(ConnectionError);
      expect(server.commands).toContain("PASV");
    } finally {
      await session.disconnect();
    }
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
  let restartOffset = 0;

  return new FakeFtpServer({
    passiveData(command) {
      if (command === "MLSD /incoming") {
        return `${reportFact}\r\n`;
      }

      if (command === "MLSD /") {
        return `${reportFact}\r\n`;
      }

      if (command === "RETR /incoming/report.csv") {
        const payload = Buffer.from(reportContent, "utf8").subarray(restartOffset);
        restartOffset = 0;
        return payload;
      }

      return undefined;
    },
    responder(command) {
      if (command === "USER tester") return "331 Password required\r\n";
      if (command === "PASS secret") return "230 Logged in\r\n";
      if (command === "TYPE I") return "200 Type set\r\n";
      if (command.startsWith("REST ")) {
        restartOffset = Number(command.slice("REST ".length));
        return `350 Restarting at ${restartOffset}\r\n`;
      }
      if (command === "MLST /incoming/report.csv") {
        return ["250-Listing\r\n", ` ${reportFact}\r\n`, "250 End\r\n"];
      }
      if (command === "MLST /") {
        return ["250-Listing\r\n", " type=cdir;perm=el; .\r\n", "250 End\r\n"];
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

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) {
    throw new Error("Expected FTP transfer operations");
  }

  return session.transfers;
}

function createReadRequest(
  path: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    endpoint: { path, provider: "ftp" },
    attempt: 1,
    job: {
      id: "ftp-read-test",
      operation: "download",
      source: { path, provider: "ftp" },
    },
    reportProgress: reportTestProgress,
    throwIfAborted: () => undefined,
  };

  if (range !== undefined) {
    request.range = range;
  }

  return request;
}

interface CreateWriteRequestOptions {
  offset?: number;
  totalBytes?: number;
  verification?: TransferVerificationResult;
}

function createWriteRequest(
  path: string,
  content: TransferDataSource,
  options: CreateWriteRequestOptions = {},
): ProviderTransferWriteRequest {
  const request: ProviderTransferWriteRequest = {
    content,
    endpoint: { path, provider: "ftp" },
    attempt: 1,
    job: {
      destination: { path, provider: "ftp" },
      id: "ftp-write-test",
      operation: "upload",
    },
    reportProgress: reportTestProgress,
    throwIfAborted: () => undefined,
  };

  if (options.offset !== undefined) request.offset = options.offset;
  if (options.totalBytes !== undefined) request.totalBytes = options.totalBytes;
  if (options.verification !== undefined) request.verification = options.verification;

  return request;
}

async function* createTextContent(
  text: string,
  chunkSize = text.length,
): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  const content = Buffer.from(text, "utf8");

  for (let offset = 0; offset < content.byteLength; offset += chunkSize) {
    yield content.subarray(offset, offset + chunkSize);
  }
}

async function readText(content: TransferDataSource): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of content) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function reportTestProgress(bytesTransferred: number, totalBytes?: number) {
  const input = {
    bytesTransferred,
    startedAt: new Date(0),
    transferId: "ftp-provider-test",
  };

  return totalBytes === undefined
    ? createProgressEvent(input)
    : createProgressEvent({ ...input, totalBytes });
}

async function findUnusedPort(): Promise<number> {
  const temporaryServer = createServer();

  await new Promise<void>((resolve) => {
    temporaryServer.listen(0, "127.0.0.1", resolve);
  });

  const address = temporaryServer.address();

  if (address === null || typeof address === "string") {
    throw new Error("Expected an ephemeral TCP port");
  }

  await new Promise<void>((resolve, reject) => {
    temporaryServer.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return address.port;
}
