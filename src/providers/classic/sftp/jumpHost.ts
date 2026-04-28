/**
 * SSH jump-host (a.k.a. bastion) socket factories for the SFTP provider.
 *
 * Returns an {@link SshSocketFactory} compatible with `ConnectionProfile.ssh.socketFactory`.
 * The factory opens a bastion SSH connection, runs `forwardOut` to the requested destination,
 * and returns the resulting channel stream. The bastion client is closed automatically when the
 * destination channel closes or errors so callers do not leak SSH connections.
 *
 * @module providers/classic/sftp/jumpHost
 */
import { Buffer } from "node:buffer";
import type { Readable } from "node:stream";
import { Client as SshClient, type ConnectConfig } from "ssh2";
import { AbortError, ConfigurationError, ConnectionError } from "../../../errors/ZeroTransferError";
import type { ZeroTransferLogger } from "../../../logging/Logger";
import type { SshSocketFactory, SshSocketFactoryContext } from "../../../types/public";

/** Options for {@link createSftpJumpHostSocketFactory}. */
export interface SftpJumpHostOptions {
  /** Static ssh2 connect configuration for the bastion. Mutually exclusive with {@link buildBastion}. */
  bastion?: ConnectConfig;
  /** Per-connection builder used to refresh credentials before each tunnel attempt. */
  buildBastion?: (context: SshSocketFactoryContext) => ConnectConfig | Promise<ConnectConfig>;
  /** Optional logger used for tunnel diagnostics. */
  logger?: ZeroTransferLogger;
  /** Optional ssh2 client factory override used in tests. */
  createClient?: () => SshClient;
}

/**
 * Builds an {@link SshSocketFactory} that tunnels SFTP connections through a bastion host.
 *
 * @param options - Bastion configuration and overrides.
 * @returns Factory that returns a forwarded ssh2 channel stream when invoked.
 * @throws {@link ConfigurationError} When neither {@link SftpJumpHostOptions.bastion} nor {@link SftpJumpHostOptions.buildBastion} is supplied.
 */
export function createSftpJumpHostSocketFactory(options: SftpJumpHostOptions): SshSocketFactory {
  if (options.bastion === undefined && options.buildBastion === undefined) {
    throw new ConfigurationError({
      code: "sftp_jump_host_config_missing",
      message: "createSftpJumpHostSocketFactory requires either bastion or buildBastion",
      retryable: false,
    });
  }
  return async (context) => {
    const config = options.buildBastion
      ? await options.buildBastion(context)
      : (options.bastion as ConnectConfig);
    return openJumpHostChannel({
      bastionConfig: config,
      context,
      ...(options.createClient !== undefined ? { createClient: options.createClient } : {}),
      ...(options.logger !== undefined ? { logger: options.logger } : {}),
    });
  };
}

interface OpenChannelOptions {
  bastionConfig: ConnectConfig;
  context: SshSocketFactoryContext;
  logger?: ZeroTransferLogger;
  createClient?: () => SshClient;
}

function openJumpHostChannel(options: OpenChannelOptions): Promise<Readable> {
  const { bastionConfig, context } = options;
  const client = options.createClient ? options.createClient() : new SshClient();
  if (context.signal?.aborted === true) {
    return Promise.reject(
      new AbortError({
        details: { operation: "jump-host" },
        host: context.host,
        message: "SFTP jump-host tunnel was aborted before opening",
        protocol: "sftp",
        retryable: false,
      }),
    );
  }
  return new Promise<Readable>((resolve, reject) => {
    const onAbort = () => {
      cleanup();
      client.end();
      reject(
        new AbortError({
          details: { operation: "jump-host" },
          host: context.host,
          message: "SFTP jump-host tunnel was aborted",
          protocol: "sftp",
          retryable: false,
        }),
      );
    };
    const cleanup = () => {
      context.signal?.removeEventListener("abort", onAbort);
    };
    context.signal?.addEventListener("abort", onAbort, { once: true });

    client.once("error", (error) => {
      cleanup();
      reject(
        new ConnectionError({
          cause: error,
          details: { stage: "bastion-connect" },
          host: context.host,
          message: `SFTP jump-host bastion connection failed: ${error.message}`,
          protocol: "sftp",
          retryable: true,
        }),
      );
    });

    client.once("ready", () => {
      client.forwardOut("127.0.0.1", 0, context.host, context.port, (error, channel) => {
        if (error) {
          cleanup();
          client.end();
          reject(
            new ConnectionError({
              cause: error,
              details: { destination: `${context.host}:${String(context.port)}` },
              host: context.host,
              message: `SFTP jump-host forwardOut failed: ${error.message}`,
              protocol: "sftp",
              retryable: true,
            }),
          );
          return;
        }
        const closeBastion = () => {
          cleanup();
          client.end();
        };
        channel.once("close", closeBastion);
        channel.once("error", closeBastion);
        options.logger?.debug?.({
          destination: `${context.host}:${String(context.port)}`,
          level: "debug",
          message: "sftp jump-host channel opened",
        });
        resolve(channel);
      });
    });

    try {
      client.connect(normalizeBastionConfig(bastionConfig));
    } catch (error) {
      cleanup();
      const cause = error instanceof Error ? error : new Error(String(error));
      reject(
        new ConnectionError({
          cause,
          details: { stage: "bastion-connect" },
          host: context.host,
          message: `SFTP jump-host bastion connection failed: ${cause.message}`,
          protocol: "sftp",
          retryable: true,
        }),
      );
    }
  });
}

function normalizeBastionConfig(config: ConnectConfig): ConnectConfig {
  // ssh2 mutates the passed config, so shallow-clone to keep callers' objects untouched.
  const cloned: ConnectConfig = { ...config };
  if (typeof cloned.privateKey === "string") {
    cloned.privateKey = Buffer.from(cloned.privateKey);
  }
  return cloned;
}
