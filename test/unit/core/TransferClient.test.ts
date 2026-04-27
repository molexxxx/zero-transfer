import { describe, expect, it, vi } from "vitest";
import {
  ConfigurationError,
  ProviderRegistry,
  TransferClient,
  UnsupportedFeatureError,
  createTransferClient,
  isClassicProviderId,
  resolveProviderId,
  type CapabilitySet,
  type ConnectionProfile,
  type ProviderFactory,
  type RemoteFileSystem,
  type TransferProvider,
  type TransferSession,
} from "../../../src/index";

const memoryCapabilities: CapabilitySet = {
  provider: "memory",
  authentication: ["anonymous"],
  list: true,
  stat: true,
  readStream: true,
  writeStream: true,
  serverSideCopy: false,
  serverSideMove: true,
  resumeDownload: false,
  resumeUpload: false,
  checksum: ["sha256"],
  atomicRename: true,
  chmod: false,
  chown: false,
  symlink: false,
  metadata: ["modifiedAt", "uniqueId"],
  maxConcurrency: 8,
  notes: ["deterministic test provider"],
};

function createFileSystem(): RemoteFileSystem {
  return {
    list: vi.fn(() =>
      Promise.resolve([
        {
          name: "file.txt",
          path: "/file.txt",
          type: "file" as const,
        },
      ]),
    ),
    stat: vi.fn(() =>
      Promise.resolve({
        exists: true as const,
        name: "file.txt",
        path: "/file.txt",
        type: "file" as const,
      }),
    ),
  };
}

function createProviderFactory(overrides: Partial<CapabilitySet> = {}): ProviderFactory<
  TransferProvider<TransferSession>
> & {
  connect: ReturnType<typeof vi.fn<(profile: ConnectionProfile) => Promise<TransferSession>>>;
  createProvider: ReturnType<typeof vi.fn<() => TransferProvider<TransferSession>>>;
} {
  const capabilities: CapabilitySet = {
    ...memoryCapabilities,
    ...overrides,
  };
  const session: TransferSession = {
    provider: capabilities.provider,
    capabilities,
    fs: createFileSystem(),
    disconnect: vi.fn(() => Promise.resolve()),
  };
  const connect = vi.fn<(profile: ConnectionProfile) => Promise<TransferSession>>(() =>
    Promise.resolve(session),
  );
  const provider: TransferProvider<TransferSession> = {
    id: capabilities.provider,
    capabilities,
    connect,
  };
  const createProvider = vi.fn<() => TransferProvider<TransferSession>>(() => provider);

  return {
    id: capabilities.provider,
    capabilities,
    connect,
    create: createProvider,
    createProvider,
  };
}

describe("ProviderRegistry", () => {
  it("registers providers, reports capabilities, and unregisters providers", () => {
    const providerFactory = createProviderFactory();
    const registry = new ProviderRegistry([providerFactory]);

    expect(registry.has("memory")).toBe(true);
    expect(registry.get("memory")).toBe(providerFactory);
    expect(registry.getCapabilities("memory")).toEqual(memoryCapabilities);
    expect(registry.requireCapabilities("memory")).toEqual(memoryCapabilities);
    expect(registry.list()).toEqual([providerFactory]);
    expect(registry.listCapabilities()).toEqual([memoryCapabilities]);
    expect(registry.unregister("memory")).toBe(true);
    expect(registry.unregister("memory")).toBe(false);
    expect(registry.has("memory")).toBe(false);
  });

  it("raises typed errors for duplicate and missing providers", () => {
    const providerFactory = createProviderFactory();
    const registry = new ProviderRegistry([providerFactory]);

    expect(() => registry.register(providerFactory)).toThrow(ConfigurationError);
    expect(() => registry.require("local")).toThrow(UnsupportedFeatureError);
    expect(registry.get("local")).toBeUndefined();
    expect(registry.getCapabilities("local")).toBeUndefined();
  });
});

describe("TransferClient", () => {
  it("creates an empty provider-neutral client", () => {
    const client = createTransferClient();

    expect(client).toBeInstanceOf(TransferClient);
    expect(client.getCapabilities()).toEqual([]);
    expect(client.hasProvider("memory")).toBe(false);
    expect(() => client.getCapabilities("memory")).toThrow(UnsupportedFeatureError);
  });

  it("registers providers and reports capability snapshots", () => {
    const client = new TransferClient();
    const providerFactory = createProviderFactory();

    expect(client.registerProvider(providerFactory)).toBe(client);
    expect(client.hasProvider("memory")).toBe(true);
    expect(client.getCapabilities()).toEqual([memoryCapabilities]);
    expect(client.getCapabilities("memory")).toEqual(memoryCapabilities);
  });

  it("connects through the selected provider and logs lifecycle context", async () => {
    const providerFactory = createProviderFactory();
    const info = vi.fn();
    const client = createTransferClient({ logger: { info }, providers: [providerFactory] });
    const session = await client.connect({
      provider: "memory",
      host: "memory.example.test",
      username: "tester",
    });

    expect(providerFactory.createProvider).toHaveBeenCalledOnce();
    expect(providerFactory.connect).toHaveBeenCalledWith({
      provider: "memory",
      host: "memory.example.test",
      username: "tester",
    });
    expect(session.capabilities).toEqual(memoryCapabilities);
    await expect(session.fs.list("/")).resolves.toHaveLength(1);
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        component: "core",
        host: "memory.example.test",
        level: "info",
        message: "Connecting through provider",
        provider: "memory",
      }),
      "Connecting through provider",
    );
  });

  it("accepts protocol as a temporary provider compatibility field", async () => {
    const providerFactory = createProviderFactory({
      provider: "sftp",
      authentication: ["password", "private-key"],
    });
    const info = vi.fn();
    const client = createTransferClient({ logger: { info }, providers: [providerFactory] });

    await client.connect({ host: "sftp.example.test", protocol: "sftp" });

    expect(providerFactory.connect).toHaveBeenCalledWith({
      host: "sftp.example.test",
      provider: "sftp",
      protocol: "sftp",
    });
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({ protocol: "sftp", provider: "sftp" }),
      "Connecting through provider",
    );
  });

  it("requires provider or protocol before connection lookup", async () => {
    const client = createTransferClient();

    await expect(client.connect({ host: "files.example.test" })).rejects.toBeInstanceOf(
      ConfigurationError,
    );
  });
});

describe("ProviderId helpers", () => {
  it("detects classic provider ids and resolves profile selections", () => {
    expect(isClassicProviderId("ftp")).toBe(true);
    expect(isClassicProviderId("memory")).toBe(false);
    expect(isClassicProviderId(undefined)).toBe(false);
    expect(resolveProviderId({ provider: "memory", protocol: "ftp" })).toBe("memory");
    expect(resolveProviderId({ protocol: "ftps" })).toBe("ftps");
    expect(resolveProviderId({})).toBeUndefined();
  });
});
