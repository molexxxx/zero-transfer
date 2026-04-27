import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ProtocolError,
  createFtpsProviderFactory,
  createTransferClient,
  type ConnectionProfile,
} from "../../src/index";
import { FakeFtpServer } from "../servers/FakeFtpServer";
import { describeProviderContract } from "./providerContract";

const certificatePath = path.join(process.cwd(), "test/fixtures/ftp/localhost-cert.pem");
const privateKeyPath = path.join(process.cwd(), "test/fixtures/ftp/localhost-key.pem");
const reportFact =
  "type=file;size=14;modify=20260427010203;perm=adfr;unique=file:report; report.csv";

let server: FakeFtpServer;
const profile: ConnectionProfile = {
  host: "127.0.0.1",
  password: { value: "secret" },
  port: 0,
  provider: "ftps",
  tls: {
    ca: { path: certificatePath },
    checkServerIdentity: () => undefined,
    maxVersion: "TLSv1.3",
    minVersion: "TLSv1.2",
    servername: "localhost",
  },
  username: { value: "tester" },
};

beforeEach(async () => {
  server = createContractFtpsServer();
  const port = await server.start();
  profile.port = port;
});

afterEach(async () => {
  await server.stop();
});

describeProviderContract("ftps", {
  createProviderFactory: () => createFtpsProviderFactory(),
  expectedCapabilities: {
    authentication: ["anonymous", "password", "client-certificate"],
    list: true,
    provider: "ftps",
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

describe("createFtpsProviderFactory", () => {
  it("negotiates explicit TLS and protects passive data transfers", async () => {
    const client = createTransferClient({ providers: [createFtpsProviderFactory()] });
    const session = await client.connect(profile);

    try {
      await expect(session.fs.list("/incoming")).resolves.toHaveLength(1);
    } finally {
      await session.disconnect();
    }

    expect(server.commands).toEqual(
      expect.arrayContaining([
        "AUTH TLS",
        "PBSZ 0",
        "PROT P",
        "USER tester",
        "PASS secret",
        "TYPE I",
        "EPSV",
        "MLSD /incoming",
      ]),
    );
  });

  it("can opt into clear FTPS data channels for compatibility", async () => {
    const client = createTransferClient({
      providers: [createFtpsProviderFactory({ dataProtection: "clear" })],
    });
    const session = await client.connect({
      ...profile,
      tls: { rejectUnauthorized: false },
    });

    try {
      await expect(session.fs.list("/incoming")).resolves.toHaveLength(1);
    } finally {
      await session.disconnect();
    }

    expect(server.commands).toContain("PROT C");
    expect(server.commands).toContain("MLSD /incoming");
  });

  it("raises typed protocol errors when AUTH TLS is rejected", async () => {
    await server.stop();
    server = new FakeFtpServer({
      responder(command) {
        if (command === "AUTH TLS") return "500 TLS unavailable\r\n";
        if (command === "QUIT") return "221 Bye\r\n";
        return "502 Unexpected command\r\n";
      },
    });
    const port = await server.start();
    const client = createTransferClient({ providers: [createFtpsProviderFactory()] });

    await expect(
      client.connect({
        host: "127.0.0.1",
        port,
        provider: "ftps",
        tls: { rejectUnauthorized: false },
      }),
    ).rejects.toBeInstanceOf(ProtocolError);
  });
});

function createContractFtpsServer(): FakeFtpServer {
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
    tls: {
      cert: readFileSync(certificatePath),
      key: readFileSync(privateKeyPath),
    },
  });
}
