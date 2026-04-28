import { Buffer } from "node:buffer";
import { createHmac } from "node:crypto";
import { connect as connectTcp } from "node:net";
import { BaseAgent, utils } from "ssh2";
import type { IdentityCallback, ParsedKey, SignCallback, SigningRequestOptions } from "ssh2";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  TransferEngine,
  createProgressEvent,
  createProviderTransferExecutor,
  createSftpProviderFactory,
  createTransferClient,
  type ConnectionProfile,
  type ProviderTransferOperations,
  type ProviderTransferReadRequest,
  type ProviderTransferWriteRequest,
  type TransferDataSource,
  type TransferSession,
  type TransferVerificationResult,
} from "../../src/index";
import { FakeSftpServer, type FakeSftpServerOptions } from "../servers/FakeSftpServer";
import { describeProviderContract } from "./providerContract";

let server: FakeSftpServer;
const profile: ConnectionProfile = {
  host: "127.0.0.1",
  password: { value: "secret" },
  port: 0,
  provider: "sftp",
  timeoutMs: 5_000,
  username: { value: "tester" },
};

beforeEach(async () => {
  server = new FakeSftpServer();
  profile.port = await server.start();
});

afterEach(async () => {
  await server.stop();
});

describeProviderContract("sftp", {
  createProviderFactory: () => createSftpProviderFactory(),
  expectedCapabilities: {
    authentication: ["password", "private-key", "agent", "keyboard-interactive"],
    list: true,
    provider: "sftp",
    readStream: true,
    resumeDownload: true,
    resumeUpload: true,
    stat: true,
    writeStream: true,
  },
  expectedListPaths: ["/incoming/report.csv"],
  expectedStat: {
    group: "1000",
    modifiedAt: new Date("2026-04-27T01:02:03.000Z"),
    name: "report.csv",
    owner: "1000",
    path: "/incoming/report.csv",
    permissions: { raw: "100644" },
    size: 14,
    type: "file",
  },
  listPath: "/incoming",
  missingPath: "/incoming/missing.csv",
  profile,
  statPath: "/incoming/report.csv",
});

describe("createSftpProviderFactory", () => {
  it("maps rejected password authentication to a typed error", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });

    await expect(
      client.connect({
        ...profile,
        password: "wrong",
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("validates SFTP provider timeout options", () => {
    expect(() => createSftpProviderFactory({ readyTimeoutMs: 0 })).toThrow(ConfigurationError);
  });

  it("requires non-empty SFTP username and at least one credential", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const missingUsernameProfile: ConnectionProfile = {
      host: "127.0.0.1",
      password: { value: "secret" },
      port: getProfilePort(),
      provider: "sftp",
      timeoutMs: 5_000,
    };
    const missingCredentialProfile: ConnectionProfile = {
      host: "127.0.0.1",
      port: getProfilePort(),
      provider: "sftp",
      timeoutMs: 5_000,
      username: { value: "tester" },
    };

    await expect(client.connect(missingUsernameProfile)).rejects.toBeInstanceOf(ConfigurationError);
    await expect(client.connect(missingCredentialProfile)).rejects.toBeInstanceOf(
      ConfigurationError,
    );
    await expect(client.connect({ ...profile, password: "" })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
  });

  it("accepts buffer credentials and provider-level SSH options", async () => {
    const profileWithoutTimeout: ConnectionProfile = {
      host: "127.0.0.1",
      password: { value: "secret" },
      port: getProfilePort(),
      provider: "sftp",
      username: { value: "tester" },
    };
    const client = createTransferClient({
      providers: [
        createSftpProviderFactory({
          hostHash: "sha256",
          hostVerifier: () => true,
          readyTimeoutMs: 5_000,
        }),
      ],
    });
    const session = await client.connect({
      ...profileWithoutTimeout,
      password: Buffer.from("secret"),
      username: Buffer.from("tester"),
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
      const raw = session.raw?.() as { sftp?: unknown } | undefined;

      expect(raw?.sftp).toBeDefined();
    } finally {
      await session.disconnect();
    }
  });

  it("connects when timeout is omitted from the profile and provider options", async () => {
    const profileWithoutTimeout: ConnectionProfile = {
      host: "127.0.0.1",
      password: { value: "secret" },
      port: getProfilePort(),
      provider: "sftp",
      username: { value: "tester" },
    };
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect(profileWithoutTimeout);

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
      });
    } finally {
      await session.disconnect();
    }
  });

  it("authenticates with SSH keyboard-interactive prompts", async () => {
    await restartServer({ keyboardInteractiveAnswers: ["123456"] });
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const challenges: string[] = [];
    const session = await client.connect({
      host: "127.0.0.1",
      port: getProfilePort(),
      provider: "sftp",
      ssh: {
        keyboardInteractive: ({ name, prompts }) => {
          challenges.push(name, ...prompts.map((prompt) => prompt.prompt));

          return ["123456"];
        },
      },
      timeoutMs: 5_000,
      username: { value: "tester" },
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
      expect(challenges).toEqual(["ZeroTransfer", "Verification code: "]);
    } finally {
      await session.disconnect();
    }
  });

  it("authenticates with SSH agent keys", async () => {
    const agentKeyPair = utils.generateKeyPairSync("ed25519");
    const agent = new StaticSftpAgent(agentKeyPair.private);

    await restartServer({ publicKey: agentKeyPair.public });

    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect({
      host: "127.0.0.1",
      port: getProfilePort(),
      provider: "sftp",
      ssh: { agent },
      timeoutMs: 5_000,
      username: { value: "tester" },
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
      expect(agent.signatures).toBeGreaterThan(0);
    } finally {
      await session.disconnect();
    }
  });

  it("connects with explicit SSH algorithm overrides", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect({
      ...profile,
      ssh: {
        algorithms: {
          compress: ["none"],
          serverHostKey: ["ssh-ed25519"],
        },
      },
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
    } finally {
      await session.disconnect();
    }
  });

  it("connects through a custom SSH socket factory", async () => {
    const socketFactoryContexts: Array<{ host: string; port: number; username?: string }> = [];
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect({
      ...profile,
      ssh: {
        socketFactory: ({ host, port, username }) =>
          new Promise((resolve, reject) => {
            const socket = connectTcp({ host, port }, () => {
              socketFactoryContexts.push(
                username === undefined ? { host, port } : { host, port, username },
              );
              resolve(socket);
            });

            socket.once("error", reject);
          }),
      },
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
      expect(socketFactoryContexts).toEqual([
        { host: "127.0.0.1", port: getProfilePort(), username: "tester" },
      ]);
    } finally {
      await session.disconnect();
    }
  });

  it("rejects failed SSH keyboard-interactive authentication", async () => {
    await restartServer({ keyboardInteractiveAnswers: ["123456"] });
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });

    await expect(
      client.connect({
        host: "127.0.0.1",
        port: getProfilePort(),
        provider: "sftp",
        ssh: { keyboardInteractive: () => ["wrong"] },
        timeoutMs: 5_000,
        username: { value: "tester" },
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
    await expect(
      client.connect({
        host: "127.0.0.1",
        port: getProfilePort(),
        provider: "sftp",
        ssh: {
          keyboardInteractive: () => {
            throw new Error("token unavailable");
          },
        },
        timeoutMs: 5_000,
        username: { value: "tester" },
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("verifies SFTP host keys with SHA-256 pins and known_hosts entries", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect({
      ...profile,
      ssh: {
        knownHosts: { value: createKnownHostsLine() },
        pinnedHostKeySha256: server.hostKeySha256,
      },
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
    } finally {
      await session.disconnect();
    }
  });

  it("accepts SFTP host-key pin and known_hosts variants", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const profiles: ConnectionProfile[] = [
      { ...profile, ssh: { pinnedHostKeySha256: createBareHostKeyPin() } },
      { ...profile, ssh: { pinnedHostKeySha256: createHexHostKeyPin() } },
      { ...profile, ssh: { knownHosts: { value: createKnownHostsLine("*.0.0.1") } } },
      { ...profile, ssh: { knownHosts: { value: createHashedKnownHostsLine() } } },
    ];

    for (const sftpProfile of profiles) {
      const session = await client.connect(sftpProfile);

      try {
        await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
          path: "/incoming/report.csv",
          type: "file",
        });
      } finally {
        await session.disconnect();
      }
    }
  });

  it("rejects mismatched or malformed SFTP host-key policies", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const wrongPin = `SHA256:${Buffer.alloc(32, 9).toString("base64").replace(/=+$/g, "")}`;

    await expect(
      client.connect({
        ...profile,
        ssh: { pinnedHostKeySha256: wrongPin },
      }),
    ).rejects.toBeInstanceOf(ConnectionError);
    await expect(
      client.connect({
        ...profile,
        ssh: { knownHosts: { value: "malformed-known-hosts-line" } },
      }),
    ).rejects.toBeInstanceOf(ConfigurationError);
    await expect(
      client.connect({
        ...profile,
        ssh: { knownHosts: { value: createKnownHostsLine("sftp.example.test") } },
      }),
    ).rejects.toBeInstanceOf(ConnectionError);
    await expect(
      client.connect({
        ...profile,
        ssh: { knownHosts: { value: createKnownHostsLine("!127.0.0.1,127.0.0.1") } },
      }),
    ).rejects.toBeInstanceOf(ConnectionError);
    await expect(
      client.connect({
        ...profile,
        ssh: { knownHosts: { value: createKnownHostsLine("|2|invalid|invalid") } },
      }),
    ).rejects.toBeInstanceOf(ConnectionError);
    await expect(
      createTransferClient({
        providers: [createSftpProviderFactory({ hostVerifier: () => true })],
      }).connect({
        ...profile,
        ssh: { pinnedHostKeySha256: server.hostKeySha256 },
      }),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });

  it("reads, writes, resumes, and copies SFTP transfer streams", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect(profile);
    const copySession = await client.connect(profile);
    const transfers = requireTransfers(session);

    try {
      const rangeRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { length: 4, offset: 3 }),
      );
      const rangeText = await readText(rangeRead.content);
      const verification: TransferVerificationResult = {
        actualChecksum: "sha256:sftp-source",
        checksum: "sha256:sftp-source",
        details: { side: "source" },
        expectedChecksum: "sha256:sftp-source",
        method: "checksum",
        verified: true,
      };
      const writeResult = await transfers.write(
        createWriteRequest("/incoming/upload.txt", createTextContent("hello", 2), {
          totalBytes: 5,
          verification,
        }),
      );
      const resumedWriteResult = await transfers.write(
        createWriteRequest("/incoming/upload.txt", createTextContent("!!"), {
          offset: 5,
          totalBytes: 7,
        }),
      );
      const emptyVerification: TransferVerificationResult = { verified: false };
      const emptyWriteResult = await transfers.write(
        createWriteRequest("/incoming/empty.txt", createChunkContent(new Uint8Array(0)), {
          totalBytes: 0,
          verification: emptyVerification,
        }),
      );
      const executor = createProviderTransferExecutor({
        resolveSession: ({ endpoint, role }) => {
          if (endpoint.provider !== "sftp") {
            return undefined;
          }

          return role === "source" ? session : copySession;
        },
      });
      const receipt = await new TransferEngine().execute(
        {
          destination: { path: "/incoming/copy.csv", provider: "sftp" },
          id: "sftp-provider-copy",
          operation: "copy",
          source: { path: "/incoming/report.csv", provider: "sftp" },
        },
        executor,
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
      expect(writeResult.verification).not.toBe(verification);
      expect(writeResult.verification?.details).not.toBe(verification.details);
      expect(resumedWriteResult).toMatchObject({
        bytesTransferred: 2,
        resumed: true,
        totalBytes: 7,
      });
      expect(emptyWriteResult).toMatchObject({
        bytesTransferred: 0,
        totalBytes: 0,
        verification: emptyVerification,
        verified: false,
      });
      expect(receipt).toMatchObject({
        bytesTransferred: 14,
        destination: { path: "/incoming/copy.csv", provider: "sftp" },
        source: { path: "/incoming/report.csv", provider: "sftp" },
        totalBytes: 14,
      });
      expect(server.readFile("/incoming/upload.txt")?.toString("utf8")).toBe("hello!!");
      expect(server.readFile("/incoming/copy.csv")?.toString("utf8")).toBe("id,name\n1,Ada\n");
      expect(server.readFile("/incoming/empty.txt")?.byteLength).toBe(0);
      expect(server.commands).toContain("OPEN /incoming/report.csv");
      expect(server.commands).toContain("OPEN /incoming/upload.txt");
    } finally {
      await session.disconnect();
      await copySession.disconnect();
    }
  });

  it("handles SFTP transfer ranges and transfer errors", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect(profile);
    const transfers = requireTransfers(session);

    try {
      const offsetRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { offset: 3 }),
      );
      const emptyRead = await transfers.read(
        createReadRequest("/incoming/report.csv", { length: 5, offset: 99 }),
      );

      expect(offsetRead).toMatchObject({ bytesRead: 3, totalBytes: 11 });
      await expect(readText(offsetRead.content)).resolves.toBe("name\n1,Ada\n");
      expect(emptyRead).toMatchObject({ bytesRead: 14, totalBytes: 0 });
      await expect(readText(emptyRead.content)).resolves.toBe("");
      await expect(transfers.read(createReadRequest("/incoming"))).rejects.toBeInstanceOf(
        PathNotFoundError,
      );
      await expect(
        transfers.write(
          createWriteRequest("/incoming/bad.txt", createTextContent("x"), { offset: -1 }),
        ),
      ).rejects.toBeInstanceOf(ConfigurationError);
    } finally {
      await session.disconnect();
    }
  });

  it("authenticates with encrypted private-key profile material", async () => {
    const keyPair = utils.generateKeyPairSync("ed25519", {
      cipher: "aes256-ctr",
      passphrase: "key-passphrase",
      rounds: 16,
    });

    await restartServer({ publicKey: keyPair.public });
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect({
      host: "127.0.0.1",
      port: getProfilePort(),
      provider: "sftp",
      ssh: {
        passphrase: { value: "key-passphrase" },
        privateKey: { value: keyPair.private },
      },
      timeoutMs: 5_000,
      username: { value: "tester" },
    });

    try {
      await expect(session.fs.stat("/incoming/report.csv")).resolves.toMatchObject({
        path: "/incoming/report.csv",
        type: "file",
      });
    } finally {
      await session.disconnect();
    }
  });

  it("maps SFTP metadata types and filters pseudo entries", async () => {
    await restartServer({
      entries: [
        { path: "/incoming", type: "directory" },
        {
          modifiedAt: new Date("2026-04-27T01:02:03.000Z"),
          path: "/incoming/report.csv",
          size: 14,
          type: "file",
        },
        { path: "/incoming/builds", type: "directory" },
        { path: "/incoming/current", permissions: 0o777, type: "symlink" },
        { path: "/incoming/device", type: "unknown" },
      ],
    });
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect(profile);

    try {
      const entries = await session.fs.list("/incoming");

      expect(entries.map((entry) => entry.name)).toEqual([
        "builds",
        "current",
        "device",
        "report.csv",
      ]);
      expect(entries.map((entry) => entry.type)).toEqual([
        "directory",
        "symlink",
        "unknown",
        "file",
      ]);
      const device = entries.find((entry) => entry.name === "device");

      expect(device).toMatchObject({ permissions: { raw: "000644" } });
    } finally {
      await session.disconnect();
    }
  });

  it("maps SFTP permission-denied statuses to typed errors", async () => {
    await restartServer({ deniedPaths: ["/incoming"] });
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect(profile);

    try {
      await expect(session.fs.list("/incoming")).rejects.toBeInstanceOf(PermissionDeniedError);
    } finally {
      await session.disconnect();
    }
  });

  it("maps rejected SFTP subsystem requests to typed protocol errors", async () => {
    await restartServer({ rejectSftp: true });
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });

    await expect(client.connect(profile)).rejects.toBeInstanceOf(ProtocolError);
  });

  it("honors abort signals during connection setup", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const controller = new AbortController();

    controller.abort();

    await expect(client.connect({ ...profile, signal: controller.signal })).rejects.toMatchObject({
      code: "ZERO_TRANSFER_ABORTED",
    });
  });

  it("maps unreachable SFTP endpoints to typed connection errors", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });

    await expect(client.connect({ ...profile, port: 1 })).rejects.toBeInstanceOf(ConnectionError);
  });

  it("honors abort signals on filesystem operations", async () => {
    const client = createTransferClient({ providers: [createSftpProviderFactory()] });
    const session = await client.connect(profile);
    const controller = new AbortController();

    controller.abort();

    try {
      await expect(
        session.fs.list("/incoming", { signal: controller.signal }),
      ).rejects.toMatchObject({
        code: "ZERO_TRANSFER_ABORTED",
      });
      expect(server.commands).not.toContain("OPENDIR /incoming");
    } finally {
      await session.disconnect();
    }
  });
});

function requireTransfers(session: TransferSession): ProviderTransferOperations {
  if (session.transfers === undefined) {
    throw new Error("Expected SFTP transfer operations");
  }

  return session.transfers;
}

class StaticSftpAgent extends BaseAgent<ParsedKey> {
  readonly key: ParsedKey;
  signatures = 0;

  constructor(privateKey: string) {
    super();
    const parsed = utils.parseKey(privateKey);

    if (parsed instanceof Error || Array.isArray(parsed)) {
      throw new Error("Expected a single parsed SFTP agent key");
    }

    this.key = parsed;
  }

  getIdentities(callback: IdentityCallback<ParsedKey>): void {
    callback(null, [this.key]);
  }

  sign(
    _publicKey: ParsedKey,
    data: Buffer,
    optionsOrCallback: SigningRequestOptions | SignCallback,
    callback?: SignCallback,
  ): void {
    const options = typeof optionsOrCallback === "function" ? undefined : optionsOrCallback;
    const finish = typeof optionsOrCallback === "function" ? optionsOrCallback : callback;

    this.signatures += 1;
    finish?.(null, this.key.sign(data, options?.hash));
  }
}

function createReadRequest(
  path: string,
  range?: ProviderTransferReadRequest["range"],
): ProviderTransferReadRequest {
  const request: ProviderTransferReadRequest = {
    endpoint: { path, provider: "sftp" },
    attempt: 1,
    job: {
      id: "sftp-read-test",
      operation: "download",
      source: { path, provider: "sftp" },
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
    endpoint: { path, provider: "sftp" },
    attempt: 1,
    job: {
      destination: { path, provider: "sftp" },
      id: "sftp-write-test",
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

async function* createChunkContent(...chunks: Uint8Array[]): AsyncGenerator<Uint8Array> {
  await Promise.resolve();

  for (const chunk of chunks) {
    yield chunk;
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
    transferId: "sftp-provider-test",
  };

  return totalBytes === undefined
    ? createProgressEvent(input)
    : createProgressEvent({ ...input, totalBytes });
}

async function restartServer(options: FakeSftpServerOptions): Promise<void> {
  await server.stop();
  server = new FakeSftpServer(options);
  profile.port = await server.start();
}

function createKnownHostsLine(hostPattern = `[127.0.0.1]:${getProfilePort()}`): string {
  return `${hostPattern} ${server.hostPublicKey}`;
}

function createHashedKnownHostsLine(): string {
  const hostPattern = `[127.0.0.1]:${getProfilePort()}`;
  const salt = Buffer.from("zero-transfer-sftp-host-key-test", "utf8");
  const hash = createHmac("sha1", salt).update(hostPattern).digest("base64");

  return createKnownHostsLine(`|1|${salt.toString("base64")}|${hash}`);
}

function createBareHostKeyPin(): string {
  return server.hostKeySha256.slice("SHA256:".length);
}

function createHexHostKeyPin(): string {
  return Buffer.from(padBase64(createBareHostKeyPin()), "base64").toString("hex");
}

function padBase64(value: string): string {
  const remainder = value.length % 4;

  return remainder === 0 ? value : `${value}${"=".repeat(4 - remainder)}`;
}

function getProfilePort(): number {
  if (profile.port === undefined) {
    throw new Error("SFTP test profile port was not initialized");
  }

  return profile.port;
}
