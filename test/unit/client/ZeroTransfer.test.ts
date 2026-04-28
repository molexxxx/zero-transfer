import { describe, expect, it, vi } from "vitest";
import {
  TransferClient,
  ZeroTransfer,
  type RemoteFileAdapter,
  UnsupportedFeatureError,
} from "../../../src/index";

function createAdapter(): {
  adapter: RemoteFileAdapter;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
} {
  const connect = vi.fn(() => Promise.resolve());
  const disconnect = vi.fn(() => Promise.resolve());
  const list = vi.fn(() =>
    Promise.resolve([
      {
        name: "file.txt",
        path: "/file.txt",
        type: "file" as const,
      },
    ]),
  );
  const stat = vi.fn(() =>
    Promise.resolve({
      exists: true as const,
      name: "file.txt",
      path: "/file.txt",
      type: "file" as const,
    }),
  );
  const adapter = {
    connect,
    disconnect,
    list,
    stat,
  } satisfies RemoteFileAdapter;

  return { adapter, connect, disconnect };
}

describe("ZeroTransfer", () => {
  it("exports ZeroTransfer as the SDK facade", () => {
    const client = ZeroTransfer.create();

    expect(client).toBeInstanceOf(ZeroTransfer);
    expect(ZeroTransfer.createTransferClient()).toBeInstanceOf(TransferClient);
    expect(client.getCapabilities()).toEqual({ adapterReady: false, protocol: "ftp" });
  });

  it("exposes default capabilities before adapters are implemented", async () => {
    const client = ZeroTransfer.create();

    expect(client.getCapabilities()).toEqual({ adapterReady: false, protocol: "ftp" });
    expect(client.isConnected()).toBe(false);
    await expect(client.list("/")).rejects.toBeInstanceOf(UnsupportedFeatureError);
  });

  it("connects, emits lifecycle events, and delegates metadata calls to an adapter", async () => {
    const { adapter, connect, disconnect } = createAdapter();
    const info = vi.fn();
    const client = ZeroTransfer.create({ adapter, logger: { info }, protocol: "ftps" });
    const connectEvent = vi.fn();
    const disconnectEvent = vi.fn();

    client.on("connect", connectEvent);
    client.on("disconnect", disconnectEvent);

    await client.connect({ host: "ftp.example.com", username: "deploy" });

    expect(client.isConnected()).toBe(true);
    expect(connect).toHaveBeenCalledWith({
      host: "ftp.example.com",
      protocol: "ftps",
      username: "deploy",
    });
    expect(connectEvent).toHaveBeenCalledWith({ host: "ftp.example.com", protocol: "ftps" });
    expect(info).toHaveBeenCalled();
    expect(await client.list("/releases")).toHaveLength(1);
    expect(await client.stat("/file.txt")).toMatchObject({ exists: true, name: "file.txt" });

    await client.disconnect();

    expect(disconnect).toHaveBeenCalledOnce();
    expect(client.isConnected()).toBe(false);
    expect(disconnectEvent).toHaveBeenCalledOnce();
  });

  it("supports a static connect helper", async () => {
    const { adapter, connect } = createAdapter();
    const client = await ZeroTransfer.connect(
      { host: "sftp.example.com", protocol: "sftp" },
      { adapter },
    );

    expect(client.getCapabilities()).toEqual({ adapterReady: true, protocol: "sftp" });
    expect(connect).toHaveBeenCalledOnce();
  });

  it("lets profiles override the static connect logger", async () => {
    const { adapter } = createAdapter();
    const optionsLogger = vi.fn();
    const profileLogger = vi.fn();
    const client = await ZeroTransfer.connect(
      { host: "ftp.example.com", logger: { info: profileLogger }, protocol: "ftp" },
      { adapter, logger: { info: optionsLogger } },
    );

    expect(client.isConnected()).toBe(true);
    expect(profileLogger).toHaveBeenCalledOnce();
    expect(optionsLogger).not.toHaveBeenCalled();
  });

  it("accepts provider as a protocol compatibility field", async () => {
    const { adapter, connect } = createAdapter();
    const client = await ZeroTransfer.connect(
      { host: "sftp.example.com", provider: "sftp" },
      { adapter },
    );

    expect(client.getCapabilities()).toEqual({ adapterReady: true, protocol: "sftp" });
    expect(connect).toHaveBeenCalledWith({
      host: "sftp.example.com",
      provider: "sftp",
      protocol: "sftp",
    });
  });

  it("does not call disconnect on adapters that are not connected", async () => {
    const { adapter, disconnect } = createAdapter();
    const client = ZeroTransfer.create({ adapter });

    await client.disconnect();

    expect(disconnect).not.toHaveBeenCalled();
  });
});
