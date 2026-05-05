/**
 * @file `runSshCommand` - high-level helper that opens an SSH connection,
 * authenticates, runs a single command on an `exec` channel, captures stdout,
 * and tears the connection down. Eliminates the manual TCP socket / transport
 * / auth / channel choreography for the common one-shot use case.
 */
import { connect, type Socket } from "node:net";

import { SshAuthSession, type SshCredential } from "./auth/SshAuthSession";
import { SshConnectionManager } from "./connection/SshConnectionManager";
import {
  SshTransportConnection,
  type SshTransportConnectionOptions,
} from "./transport/SshTransportConnection";

/**
 * Options for {@link runSshCommand}.
 */
export interface RunSshCommandOptions {
  /** Hostname or IP of the SSH server. */
  host: string;
  /** TCP port. Defaults to `22`. */
  port?: number;
  /** Command to execute on the remote shell. */
  command: string;
  /**
   * Authentication credential. Use one of:
   *
   * - `{ type: "password", username, password }`
   * - `{ type: "publickey", username, algorithmName, publicKeyBlob, sign }`
   *   (build one from a private-key file with `buildPublickeyCredential`)
   * - `{ type: "keyboard-interactive", username, respond }`
   */
  auth: SshCredential;
  /**
   * Forwarded to {@link SshTransportConnection}; covers host-key pinning,
   * algorithm overrides, and handshake timeout. The default
   * `handshakeTimeoutMs` is 10 seconds.
   */
  transport?: SshTransportConnectionOptions;
  /** TCP connect timeout in milliseconds. Defaults to 10 000. */
  connectTimeoutMs?: number;
  /** Maximum total bytes captured from stdout. Defaults to 16 MiB. */
  maxOutputBytes?: number;
}

/**
 * Result of {@link runSshCommand}. The full captured stdout is provided as
 * both a `Buffer` (for binary output) and as a UTF-8 decoded `string`.
 *
 * Note: stderr (CHANNEL_EXTENDED_DATA) and exit-status are not currently
 * surfaced - drop down to {@link SshConnectionManager}/{@link SshSessionChannel}
 * directly if you need them.
 */
export interface RunSshCommandResult {
  /** Captured stdout as raw bytes. */
  stdout: Buffer;
  /** Captured stdout decoded as UTF-8. */
  stdoutText: string;
  /** Bytes received before the channel closed. */
  bytesReceived: number;
}

const DEFAULT_PORT = 22;
const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;
const DEFAULT_HANDSHAKE_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_OUTPUT_BYTES = 16 * 1024 * 1024;

/**
 * Connects, authenticates, runs `command` on a fresh exec channel, drains
 * stdout, and disconnects. The TCP socket, transport, auth session, and
 * channel are all owned by this helper and torn down before it returns.
 *
 * @example Run `uname -a` with a password credential
 * ```ts
 * import { runSshCommand } from "@zero-transfer/ssh";
 *
 * const { stdoutText } = await runSshCommand({
 *   host: "ssh.example.com",
 *   auth: { type: "password", username: "deploy", password: process.env.SSH_PASSWORD! },
 *   command: "uname -a",
 * });
 * console.log(stdoutText);
 * ```
 */
export async function runSshCommand(options: RunSshCommandOptions): Promise<RunSshCommandResult> {
  const {
    host,
    port = DEFAULT_PORT,
    command,
    auth,
    transport: transportOptions,
    connectTimeoutMs = DEFAULT_CONNECT_TIMEOUT_MS,
    maxOutputBytes = DEFAULT_MAX_OUTPUT_BYTES,
  } = options;

  const socket = await openTcpSocket(host, port, connectTimeoutMs);
  const transport = new SshTransportConnection({
    handshakeTimeoutMs: DEFAULT_HANDSHAKE_TIMEOUT_MS,
    ...transportOptions,
  });

  try {
    const handshake = await transport.connect(socket);

    const authSession = new SshAuthSession(transport);
    await authSession.authenticate({
      credential: auth,
      sessionId: handshake.keyExchange.sessionId,
    });

    const conn = new SshConnectionManager(transport);
    const channel = await conn.openExecChannel(command);

    const pump = conn.start();
    pump.catch(() => {
      // Errors surface through the receiveData() iterator below.
    });

    const chunks: Buffer[] = [];
    let bytesReceived = 0;
    try {
      for await (const chunk of channel.receiveData()) {
        bytesReceived += chunk.length;
        if (bytesReceived > maxOutputBytes) {
          throw new Error(
            `runSshCommand: stdout exceeded ${maxOutputBytes} bytes (set maxOutputBytes to allow more)`,
          );
        }
        chunks.push(chunk);
      }
    } finally {
      channel.close();
    }

    const stdout = Buffer.concat(chunks);
    return {
      stdout,
      stdoutText: stdout.toString("utf8"),
      bytesReceived,
    };
  } finally {
    transport.disconnect();
  }
}

/**
 * Opens a TCP socket with a timeout, returning it in the connected state.
 * @internal
 */
function openTcpSocket(host: string, port: number, timeoutMs: number): Promise<Socket> {
  return new Promise<Socket>((resolve, reject) => {
    const socket = connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(
        new Error(`runSshCommand: TCP connect to ${host}:${port} timed out after ${timeoutMs}ms`),
      );
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
