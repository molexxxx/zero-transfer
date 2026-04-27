/**
 * Deterministic fake FTP control server for unit and integration-style tests.
 *
 * The harness accepts TCP connections, sends a configurable greeting, records received
 * commands, and delegates each command to a scripted responder. It can also open a
 * passive data socket for deterministic MLSD-style listing tests. It is intentionally
 * minimal so tests can exercise parser and command-lifecycle behavior without a real
 * FTP daemon.
 *
 * @module test/servers/FakeFtpServer
 */
import { createServer, type Server, type Socket } from "node:net";
import { Buffer } from "node:buffer";
import { createSecureContext, TLSSocket, type SecureContextOptions } from "node:tls";

/**
 * Callback that returns a response for a received FTP command.
 *
 * @param command - Command text without a trailing CRLF delimiter.
 * @returns Response text, response chunks, or `undefined` to send no response.
 */
export type FakeFtpResponder = (command: string) => string | string[] | undefined;

/**
 * Callback that returns passive data payloads for transfer commands such as MLSD.
 *
 * @param command - Command text without a trailing CRLF delimiter.
 * @returns Data payload to send, `null` to leave the data socket idle, or `undefined`.
 */
export type FakeFtpDataResponder = (command: string) => string | Uint8Array | null | undefined;

/** Callback that formats a passive-mode control response for a data socket port. */
export type FakeFtpPassiveResponseFactory = (port: number) => string;

/** TLS certificate options used by the fake explicit FTPS server mode. */
export interface FakeFtpTlsOptions {
  /** Server private key PEM. */
  key: SecureContextOptions["key"];
  /** Server certificate PEM. */
  cert: SecureContextOptions["cert"];
}

/** Passive upload captured by the fake FTP data server. */
export interface FakeFtpUpload {
  /** Command that opened the passive upload, such as `STOR /path`. */
  command: string;
  /** Bytes received on the passive data socket. */
  content: Buffer;
}

/**
 * Configuration for a {@link FakeFtpServer} instance.
 */
export interface FakeFtpServerOptions {
  /** Greeting sent immediately after a client connects. */
  greeting?: string;
  /** Scripted responder used for each received command. */
  responder?: FakeFtpResponder;
  /** Scripted data responder used after passive-mode negotiation for transfer commands. */
  passiveData?: FakeFtpDataResponder;
  /** Whether EPSV should be handled by the fake server when passive data is configured. */
  extendedPassive?: boolean;
  /** Custom PASV response formatter for parser compatibility tests. */
  passiveResponse?: FakeFtpPassiveResponseFactory;
  /** Final response sent after passive transfer data, or `null` to simulate a stalled server. */
  passiveFinalResponse?: string | null;
  /** Enables explicit FTPS support for AUTH TLS, PBSZ, PROT, and passive data sockets. */
  tls?: FakeFtpTlsOptions;
}

interface PassiveDataChannel {
  server: Server;
  socket?: Socket;
  socketPromise: Promise<Socket>;
}

/**
 * Small TCP FTP control server for deterministic protocol tests.
 */
export class FakeFtpServer {
  private readonly greeting: string;
  private readonly extendedPassive: boolean;
  private readonly passiveData: FakeFtpDataResponder | undefined;
  private readonly passiveFinalResponse: string | null;
  private readonly passiveResponse: FakeFtpPassiveResponseFactory;
  private readonly responder: FakeFtpResponder;
  private readonly server: Server;
  private readonly tls: FakeFtpTlsOptions | undefined;
  private readonly passiveUploads: FakeFtpUpload[] = [];
  private readonly receivedCommands: string[] = [];
  private readonly sockets = new Set<Socket>();
  private passiveDataChannel: PassiveDataChannel | undefined;
  private protectPassiveData = false;

  /**
   * Creates a fake server without binding a port.
   *
   * @param options - Optional greeting and command responder.
   */
  constructor(options: FakeFtpServerOptions = {}) {
    this.greeting = options.greeting ?? "220 ZeroFTP fake server ready\r\n";
    this.extendedPassive = options.extendedPassive ?? true;
    this.passiveData = options.passiveData;
    this.passiveFinalResponse =
      options.passiveFinalResponse === undefined
        ? "226 Transfer complete\r\n"
        : options.passiveFinalResponse;
    this.passiveResponse = options.passiveResponse ?? createDefaultPassiveResponse;
    this.responder = options.responder ?? (() => "200 OK\r\n");
    this.tls = options.tls;
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
    await this.closePassiveDataChannel();

    for (const socket of this.sockets) {
      socket.destroy();
    }

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

  /** Gets a copy of passive upload payloads received by the server. */
  get uploads(): FakeFtpUpload[] {
    return this.passiveUploads.map((upload) => ({
      command: upload.command,
      content: Buffer.from(upload.content),
    }));
  }

  /**
   * Wires a connected client socket to the scripted FTP responder.
   *
   * @param socket - Accepted TCP socket.
   * @returns Nothing.
   */
  private handleSocket(socket: Socket): void {
    this.sockets.add(socket);
    socket.write(this.greeting);
    socket.on("close", () => this.sockets.delete(socket));
    this.wireCommandSocket(socket);
  }

  private wireCommandSocket(socket: Socket): void {
    socket.setEncoding("utf8");

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
        void this.handleCommand(socket, line);
      }
    });
  }

  private async handleCommand(socket: Socket, command: string): Promise<void> {
    if (command === "AUTH TLS" && this.tls !== undefined) {
      socket.write("234 AUTH TLS successful\r\n", () => this.upgradeControlSocket(socket));
      return;
    }

    if (command === "PBSZ 0" && this.tls !== undefined) {
      socket.write("200 PBSZ=0\r\n");
      return;
    }

    if (command === "PROT P" && this.tls !== undefined) {
      this.protectPassiveData = true;
      socket.write("200 Data channel protection set\r\n");
      return;
    }

    if (command === "PROT C" && this.tls !== undefined) {
      this.protectPassiveData = false;
      socket.write("200 Data channel protection cleared\r\n");
      return;
    }

    if (command === "EPSV" && this.passiveData !== undefined && this.extendedPassive) {
      const port = await this.openPassiveDataChannel();
      socket.write(`229 Entering Extended Passive Mode (|||${port}|)\r\n`);
      return;
    }

    if (command === "PASV" && this.passiveData !== undefined) {
      const port = await this.openPassiveDataChannel();
      socket.write(this.passiveResponse(port));
      return;
    }

    if (this.passiveDataChannel !== undefined && command.startsWith("STOR")) {
      socket.write("150 Opening passive data connection\r\n");
      await this.readPassiveUpload(command);
      this.writePassiveFinalResponse(socket);
      return;
    }

    if (this.passiveDataChannel !== undefined && isPassiveDownloadCommand(command)) {
      const payload = this.passiveData?.(command);

      if (payload !== undefined) {
        socket.write("150 Opening passive data connection\r\n");

        if (payload === null) {
          return;
        }

        await this.writePassiveData(payload);
        this.writePassiveFinalResponse(socket);
        return;
      }

      await this.closePassiveDataChannel();
    }

    const response = this.responder(command);

    if (response === undefined) {
      return;
    }

    socket.write(Array.isArray(response) ? response.join("") : response);
  }

  private upgradeControlSocket(socket: Socket): void {
    if (this.tls === undefined) {
      return;
    }

    socket.removeAllListeners("data");
    const tlsSocket = this.createTlsServerSocket(socket);
    this.sockets.add(tlsSocket);
    tlsSocket.on("close", () => this.sockets.delete(tlsSocket));
    tlsSocket.on("error", () => undefined);
    this.wireCommandSocket(tlsSocket);
  }

  private async readPassiveUpload(command: string): Promise<void> {
    const channel = this.passiveDataChannel;

    if (channel === undefined) {
      return;
    }

    this.passiveDataChannel = undefined;
    const socket = await channel.socketPromise;
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      socket.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      socket.once("end", resolve);
      socket.once("error", reject);
    });

    this.passiveUploads.push({ command, content: Buffer.concat(chunks) });
    await closeServer(channel.server);
  }

  private async openPassiveDataChannel(): Promise<number> {
    await this.closePassiveDataChannel();

    let resolveSocket: (socket: Socket) => void;
    const socketPromise = new Promise<Socket>((resolve) => {
      resolveSocket = resolve;
    });
    const server = createServer((socket) => {
      const dataSocket = this.createPassiveDataSocket(socket);

      if (this.passiveDataChannel !== undefined) {
        this.passiveDataChannel.socket = dataSocket;
      }

      resolveSocket(dataSocket);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    this.passiveDataChannel = { server, socketPromise };
    const address = server.address();

    if (address === null || typeof address === "string") {
      throw new Error("Fake FTP passive data server is not listening on a TCP port");
    }

    return address.port;
  }

  private createPassiveDataSocket(socket: Socket): Socket {
    if (!this.protectPassiveData || this.tls === undefined) {
      return socket;
    }

    const tlsSocket = this.createTlsServerSocket(socket);
    tlsSocket.on("error", () => undefined);
    return tlsSocket;
  }

  private createTlsServerSocket(socket: Socket): TLSSocket {
    if (this.tls === undefined) {
      throw new Error("Fake FTP TLS options are not configured");
    }

    return new TLSSocket(socket, {
      isServer: true,
      secureContext: createSecureContext(this.tls),
    });
  }

  private async writePassiveData(payload: string | Uint8Array): Promise<void> {
    const channel = this.passiveDataChannel;

    if (channel === undefined) {
      return;
    }

    this.passiveDataChannel = undefined;
    const socket = await channel.socketPromise;

    await new Promise<void>((resolve, reject) => {
      socket.once("error", reject);
      socket.end(payload, resolve);
    });

    await closeServer(channel.server);
  }

  private async closePassiveDataChannel(): Promise<void> {
    const channel = this.passiveDataChannel;

    if (channel === undefined) {
      return;
    }

    this.passiveDataChannel = undefined;
    channel.socket?.destroy();
    await closeServer(channel.server);
  }

  private writePassiveFinalResponse(socket: Socket): void {
    if (this.passiveFinalResponse !== null) {
      socket.write(this.passiveFinalResponse);
    }
  }
}

function isPassiveDownloadCommand(command: string): boolean {
  return command.startsWith("MLSD") || command.startsWith("RETR");
}

function createDefaultPassiveResponse(port: number): string {
  const highByte = Math.floor(port / 256);
  const lowByte = port % 256;
  return `227 Entering Passive Mode (127,0,0,1,${highByte},${lowByte})\r\n`;
}

async function closeServer(server: Server): Promise<void> {
  if (!server.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
