import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import {
  ConfigurationError,
  ConnectionError,
  createSftpJumpHostSocketFactory,
} from "../../../../../src/index";
import type { Client as SshClient, ConnectConfig } from "ssh2";

class FakeSshClient extends EventEmitter {
  public connectArgs: ConnectConfig | undefined;
  public ended = false;
  public readonly forwardOutCalls: Array<{ destHost: string; destPort: number }> = [];
  public forwardOutImpl: ((destHost: string, destPort: number) => Error | PassThrough) | undefined;

  connect(config: ConnectConfig): this {
    this.connectArgs = config;
    queueMicrotask(() => this.emit("ready"));
    return this;
  }

  end(): this {
    this.ended = true;
    return this;
  }

  forwardOut(
    _srcHost: string,
    _srcPort: number,
    destHost: string,
    destPort: number,
    callback: (error: Error | undefined, channel?: PassThrough) => void,
  ): boolean {
    this.forwardOutCalls.push({ destHost, destPort });
    queueMicrotask(() => {
      const result = this.forwardOutImpl
        ? this.forwardOutImpl(destHost, destPort)
        : new PassThrough();
      if (result instanceof Error) {
        callback(result);
        return;
      }
      callback(undefined, result);
    });
    return true;
  }
}

function makeFactory(client: FakeSshClient, bastion: ConnectConfig) {
  return createSftpJumpHostSocketFactory({
    bastion,
    createClient: () => client as unknown as SshClient,
  });
}

describe("createSftpJumpHostSocketFactory", () => {
  it("connects to the bastion and forwards to the destination", async () => {
    const client = new FakeSshClient();
    const factory = makeFactory(client, {
      host: "bastion.example.com",
      password: "p",
      port: 22,
      username: "ops",
    });

    const socket = await factory({ host: "target.example.com", port: 22, username: "tony" });

    expect(socket).toBeInstanceOf(PassThrough);
    expect(client.connectArgs?.host).toBe("bastion.example.com");
    expect(client.forwardOutCalls).toEqual([{ destHost: "target.example.com", destPort: 22 }]);
  });

  it("closes the bastion when the forwarded channel closes", async () => {
    const client = new FakeSshClient();
    const factory = makeFactory(client, { host: "bastion", port: 22 });
    const socket = (await factory({ host: "target", port: 22 })) as PassThrough;

    expect(client.ended).toBe(false);
    socket.emit("close");
    expect(client.ended).toBe(true);
  });

  it("wraps forwardOut errors into ConnectionError and ends the bastion", async () => {
    const client = new FakeSshClient();
    client.forwardOutImpl = () => new Error("administratively prohibited");
    const factory = makeFactory(client, { host: "bastion", port: 22 });

    await expect(factory({ host: "target", port: 22 })).rejects.toBeInstanceOf(ConnectionError);
    expect(client.ended).toBe(true);
  });

  it("rebuilds bastion config per call when buildBastion is supplied", async () => {
    const client = new FakeSshClient();
    const buildBastion = vi.fn(() =>
      Promise.resolve({ host: "bastion-build", port: 22, username: "ops" } satisfies ConnectConfig),
    );
    const factory = createSftpJumpHostSocketFactory({
      buildBastion,
      createClient: () => client as unknown as SshClient,
    });

    await factory({ host: "target", port: 22, username: "tony" });
    expect(buildBastion).toHaveBeenCalledOnce();
    expect(client.connectArgs?.host).toBe("bastion-build");
  });

  it("throws when neither bastion nor buildBastion is supplied", () => {
    expect(() => createSftpJumpHostSocketFactory({})).toThrow(ConfigurationError);
  });
});
