import { Buffer } from "node:buffer";
import { utils } from "ssh2";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AuthenticationError,
  ConfigurationError,
  ConnectionError,
  PermissionDeniedError,
  ProtocolError,
  createSftpProviderFactory,
  createTransferClient,
  type ConnectionProfile,
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
    authentication: ["password", "private-key"],
    list: true,
    provider: "sftp",
    readStream: false,
    stat: true,
    writeStream: false,
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

async function restartServer(options: FakeSftpServerOptions): Promise<void> {
  await server.stop();
  server = new FakeSftpServer(options);
  profile.port = await server.start();
}

function getProfilePort(): number {
  if (profile.port === undefined) {
    throw new Error("SFTP test profile port was not initialized");
  }

  return profile.port;
}
