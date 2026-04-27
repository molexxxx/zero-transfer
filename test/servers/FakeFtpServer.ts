/**
 * Deterministic fake FTP control server for unit and integration-style tests.
 *
 * The harness accepts TCP connections, sends a configurable greeting, records received
 * commands, and delegates each command to a scripted responder. It is intentionally
 * minimal so tests can exercise parser and command-lifecycle behavior without a real
 * FTP daemon.
 *
 * @module test/servers/FakeFtpServer
 */
import { createServer, type Server, type Socket } from "node:net";

/**
 * Callback that returns a response for a received FTP command.
 *
 * @param command - Command text without a trailing CRLF delimiter.
 * @returns Response text, response chunks, or `undefined` to send no response.
 */
export type FakeFtpResponder = (command: string) => string | string[] | undefined;

/**
 * Configuration for a {@link FakeFtpServer} instance.
 */
export interface FakeFtpServerOptions {
  /** Greeting sent immediately after a client connects. */
  greeting?: string;
  /** Scripted responder used for each received command. */
  responder?: FakeFtpResponder;
}

/**
 * Small TCP FTP control server for deterministic protocol tests.
 */
export class FakeFtpServer {
  private readonly greeting: string;
  private readonly responder: FakeFtpResponder;
  private readonly server: Server;
  private readonly receivedCommands: string[] = [];

  /**
   * Creates a fake server without binding a port.
   *
   * @param options - Optional greeting and command responder.
   */
  constructor(options: FakeFtpServerOptions = {}) {
    this.greeting = options.greeting ?? "220 ZeroFTP fake server ready\r\n";
    this.responder = options.responder ?? (() => "200 OK\r\n");
    this.server = createServer((socket) => this.handleSocket(socket));
  }

  /**
   * Starts listening on a random local TCP port.
   *
   * @returns The bound TCP port.
   */
  async start(): Promise<number> {
    await new Promise<void>((resolve) => {
      this.server.listen(0, "127.0.0.1", resolve);
    });

    return this.port;
  }

  /**
   * Stops the server if it is currently listening.
   *
   * @returns A promise that resolves after the server is closed.
   */
  async stop(): Promise<void> {
    if (!this.server.listening) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Gets the currently bound TCP port.
   *
   * @returns The listening port.
   * @throws Error When the server is not listening on a TCP address.
   */
  get port(): number {
    const address = this.server.address();

    if (address === null || typeof address === "string") {
      throw new Error("Fake FTP server is not listening on a TCP port");
    }

    return address.port;
  }

  /**
   * Gets a copy of all commands received by the server.
   *
   * @returns Recorded command lines without CRLF delimiters.
   */
  get commands(): string[] {
    return [...this.receivedCommands];
  }

  /**
   * Wires a connected client socket to the scripted FTP responder.
   *
   * @param socket - Accepted TCP socket.
   * @returns Nothing.
   */
  private handleSocket(socket: Socket): void {
    socket.setEncoding("utf8");
    socket.write(this.greeting);

    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.length === 0) {
          continue;
        }

        this.receivedCommands.push(line);
        const response = this.responder(line);

        if (response === undefined) {
          continue;
        }

        socket.write(Array.isArray(response) ? response.join("") : response);
      }
    });
  }
}
