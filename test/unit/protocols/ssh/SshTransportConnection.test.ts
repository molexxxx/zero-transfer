/**
 * Integration-style unit tests for SshTransportConnection.
 * Uses a loopback TCP socket pair and a minimal fake SSH server to exercise the full
 * handshake + encrypted message exchange pipeline without an external process.
 */
import { Buffer } from "node:buffer";
import {
  createServer,
  createConnection,
  type AddressInfo,
  type Server,
  type Socket,
} from "node:net";
import { generateKeyPairSync, sign as cryptoSign } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConnectionError, ProtocolError } from "../../../../src/errors/ZeroTransferError";
import {
  SshTransportConnection,
  SshDisconnectReason,
  DEFAULT_SSH_ALGORITHM_PREFERENCES,
  negotiateSshAlgorithms,
  encodeSshKexInitMessage,
  decodeSshKexInitMessage,
  decodeSshKexEcdhInitMessage,
  encodeSshKexEcdhReplyMessage,
  encodeSshNewKeysMessage,
  createCurve25519Ephemeral,
  deriveSshSessionKeys,
  createSshTransportProtectionContext,
  encodeSshTransportPacket,
  SshTransportPacketFramer,
  type SshTransportProtectionContext,
  type NegotiatedSshAlgorithms,
} from "../../../../src/protocols/ssh/transport";
import { SshDataWriter } from "../../../../src/protocols/ssh/binary/SshDataWriter";

// ---------------------------------------------------------------------------
// Algorithm preferences for the fake server (CTR only — our protection layer
// currently supports AES-CTR + HMAC; chacha/gcm are planned for later waves).
// ---------------------------------------------------------------------------
const FAKE_SERVER_ALGOS = {
  ...DEFAULT_SSH_ALGORITHM_PREFERENCES,
  encryptionClientToServer: ["aes256-ctr"],
  encryptionServerToClient: ["aes256-ctr"],
  macClientToServer: ["hmac-sha2-512"],
  macServerToClient: ["hmac-sha2-512"],
} as const;

// Client preferences reduced to overlap with the fake server.
const CLIENT_ALGOS = {
  ...DEFAULT_SSH_ALGORITHM_PREFERENCES,
  encryptionClientToServer: ["aes256-ctr", "aes128-ctr"],
  encryptionServerToClient: ["aes256-ctr", "aes128-ctr"],
  macClientToServer: ["hmac-sha2-512", "hmac-sha2-256"],
  macServerToClient: ["hmac-sha2-512", "hmac-sha2-256"],
};

// ---------------------------------------------------------------------------
// Minimal fake SSH server
// Runs a server-side SSH handshake and resolves with the bidirectional
// protection context once both sides have exchanged NEWKEYS.
// ---------------------------------------------------------------------------

async function runFakeServerHandshake(serverSocket: Socket): Promise<{
  negotiated: NegotiatedSshAlgorithms;
  protection: SshTransportProtectionContext;
}> {
  const { privateKey: hostPrivKey, publicKey: hostPubKey } = generateKeyPairSync("ed25519");
  const spki = Buffer.from(hostPubKey.export({ type: "spki", format: "der" }));
  const hostPubRaw = spki.subarray(-32);

  const serverKexInitPayload = encodeSshKexInitMessage({ algorithms: FAKE_SERVER_ALGOS });

  return new Promise((resolve, reject) => {
    let idBuffer = Buffer.alloc(0);
    let idDone = false;
    let clientId = "";
    let clientKexInitPayload: Buffer | undefined;
    let phase: "id" | "kexinit" | "kexreply" | "newkeys" = "id";
    let negotiated!: NegotiatedSshAlgorithms;
    let serverProtection!: SshTransportProtectionContext;
    const framer = new SshTransportPacketFramer();

    serverSocket.write("SSH-2.0-FakeTestServer\r\n");

    serverSocket.on("error", reject);
    serverSocket.on("close", () => {
      if (phase !== "newkeys") reject(new Error("server socket closed before handshake"));
    });

    const processPackets = (chunk: Buffer): void => {
      try {
        for (const packet of framer.push(chunk)) {
          if (phase === "kexinit") {
            clientKexInitPayload = Buffer.from(packet.payload);
            const decoded = decodeSshKexInitMessage(clientKexInitPayload);
            negotiated = negotiateSshAlgorithms(FAKE_SERVER_ALGOS, decoded);
            phase = "kexreply";
          } else if (phase === "kexreply") {
            const init = decodeSshKexEcdhInitMessage(packet.payload);
            const serverEphemeral = createCurve25519Ephemeral();
            const sharedSecret = serverEphemeral.deriveSharedSecret(init.clientPublicKey);

            const hostKeyBuf = new SshDataWriter()
              .writeString("ssh-ed25519", "utf8")
              .writeString(hostPubRaw)
              .toBuffer();

            const derived = deriveSshSessionKeys({
              clientIdentification: clientId,
              clientKexInitPayload: clientKexInitPayload!,
              clientPublicKey: init.clientPublicKey,
              kexAlgorithm: negotiated.kexAlgorithm,
              negotiatedAlgorithms: negotiated,
              serverHostKey: hostKeyBuf,
              serverIdentification: "SSH-2.0-FakeTestServer",
              serverKexInitPayload,
              serverPublicKey: serverEphemeral.publicKey,
              sharedSecret,
            });

            const sigBytes = cryptoSign(null, derived.exchangeHash, hostPrivKey);
            const signatureBuf = new SshDataWriter()
              .writeString("ssh-ed25519", "utf8")
              .writeString(sigBytes)
              .toBuffer();

            serverSocket.write(
              encodeSshTransportPacket(
                encodeSshKexEcdhReplyMessage({
                  hostKey: hostKeyBuf,
                  serverPublicKey: serverEphemeral.publicKey,
                  signature: signatureBuf,
                }),
              ),
            );
            serverSocket.write(encodeSshTransportPacket(encodeSshNewKeysMessage()));

            serverProtection = createSshTransportProtectionContext({
              // Server perspective: swap key directions and algorithm names so that
              // the context's "outbound" encrypts server→client and "inbound" decrypts client→server.
              keys: {
                clientToServer: derived.serverToClient,
                serverToClient: derived.clientToServer,
              },
              negotiatedAlgorithms: {
                ...negotiated,
                encryptionClientToServer: negotiated.encryptionServerToClient,
                encryptionServerToClient: negotiated.encryptionClientToServer,
                macClientToServer: negotiated.macServerToClient,
                macServerToClient: negotiated.macClientToServer,
              },
              // RFC 4253 §6.4: sequence numbers are never reset across NEWKEYS.
              // Both sides have exchanged 3 unencrypted handshake packets
              // (KEXINIT, KEX_ECDH_INIT/REPLY, NEWKEYS).
              initialInboundSequence: 3,
              initialOutboundSequence: 3,
            });

            phase = "newkeys";
          } else if (phase === "newkeys") {
            serverSocket.off("data", onData);
            const leftover = framer.takeRemainingBytes();
            if (leftover.length > 0) {
              serverProtection.inbound.pushBytes(leftover);
            }
            resolve({ negotiated, protection: serverProtection });
          }
        }
      } catch (err) {
        console.error(`[server] processPackets error: ${String(err)}`);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    const onData = (chunk: Buffer): void => {
      if (!idDone) {
        idBuffer = Buffer.concat([idBuffer, chunk]);
        const crlf = idBuffer.indexOf("\r\n");
        if (crlf < 0) return;

        clientId = idBuffer.subarray(0, crlf).toString("ascii");
        const remainder = Buffer.from(idBuffer.subarray(crlf + 2));
        idDone = true;

        serverSocket.write(encodeSshTransportPacket(serverKexInitPayload));
        phase = "kexinit";

        if (remainder.length > 0) processPackets(remainder);
        return;
      }

      processPackets(chunk);
    };

    serverSocket.on("data", onData);
  });
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Resolves with [clientSocket, serverSocket] once the TCP connection is established on both sides. */
function waitForConnection(server: Server, port: number): Promise<[Socket, Socket]> {
  return new Promise<[Socket, Socket]>((resolve) => {
    let clientSock: Socket | undefined;
    let serverSock: Socket | undefined;

    const check = (): void => {
      if (clientSock !== undefined && serverSock !== undefined) {
        resolve([clientSock, serverSock]);
      }
    };

    server.once("connection", (s) => {
      serverSock = s;
      check();
    });

    const s = createConnection({ host: "127.0.0.1", port }, () => {
      clientSock = s;
      check();
    });
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("SshTransportConnection", () => {
  let server: Server;
  let serverPort: number;
  const openSockets: Socket[] = [];

  beforeEach(async () => {
    server = createServer();
    await new Promise<void>((res) => server.listen(0, "127.0.0.1", res));
    serverPort = (server.address() as AddressInfo).port;
  });

  afterEach(async () => {
    for (const s of openSockets.splice(0)) s.destroy();
    await new Promise<void>((res, rej) => server.close((err) => (err ? rej(err) : res())));
  });

  it("completes the SSH handshake and returns session keys", async () => {
    const [clientSocket, serverSocket] = await waitForConnection(server, serverPort);
    openSockets.push(clientSocket, serverSocket);

    const conn = new SshTransportConnection({ algorithms: CLIENT_ALGOS });

    const [clientResult, serverResult] = await Promise.all([
      conn.connect(clientSocket),
      runFakeServerHandshake(serverSocket),
    ]);

    expect(clientResult.keyExchange.sessionId).toHaveLength(32); // SHA-256
    expect(clientResult.negotiatedAlgorithms.kexAlgorithm).toBe("curve25519-sha256");
    expect(clientResult.negotiatedAlgorithms.encryptionClientToServer).toBe("aes256-ctr");
    expect(clientResult.serverIdentification.softwareVersion).toBe("FakeTestServer");
    expect(serverResult.negotiated.kexAlgorithm).toBe("curve25519-sha256");

    conn.disconnect();
  });

  it("sends and receives encrypted payloads after handshake", async () => {
    const [clientSocket, serverSocket] = await waitForConnection(server, serverPort);
    openSockets.push(clientSocket, serverSocket);

    const conn = new SshTransportConnection({ algorithms: CLIENT_ALGOS });

    const [, { protection }] = await Promise.all([
      conn.connect(clientSocket),
      runFakeServerHandshake(serverSocket),
    ]);

    // Set up echo server BEFORE sending any data.
    serverSocket.on("data", (chunk: Buffer) => {
      for (const p of protection.inbound.pushBytes(chunk)) {
        serverSocket.write(protection.outbound.protectPayload(p));
      }
    });

    const received: Buffer[] = [];
    const done = (async () => {
      for await (const payload of conn.receivePayloads()) {
        received.push(payload);
        if (received.length === 2) break;
      }
    })();

    conn.sendPayload(Buffer.from([94, 0, 0, 0, 5])); // SSH_MSG_CHANNEL_DATA stand-in
    conn.sendPayload(Buffer.from([94, 0, 0, 0, 6]));

    await done;

    expect(received).toHaveLength(2);
    expect(received[0]).toEqual(Buffer.from([94, 0, 0, 0, 5]));
    expect(received[1]).toEqual(Buffer.from([94, 0, 0, 0, 6]));

    conn.disconnect();
  });

  it("terminates receivePayloads on SSH_MSG_DISCONNECT from server", async () => {
    const [clientSocket, serverSocket] = await waitForConnection(server, serverPort);
    openSockets.push(clientSocket, serverSocket);

    const conn = new SshTransportConnection({ algorithms: CLIENT_ALGOS });

    const [, { protection }] = await Promise.all([
      conn.connect(clientSocket),
      runFakeServerHandshake(serverSocket),
    ]);

    // Send SSH_MSG_DISCONNECT from server immediately after handshake.
    const disconnectPayload = new SshDataWriter()
      .writeByte(1) // SSH_MSG_DISCONNECT
      .writeUint32(SshDisconnectReason.BY_APPLICATION)
      .writeString("test disconnect", "utf8")
      .writeString("", "utf8") // language tag
      .toBuffer();
    serverSocket.write(protection.outbound.protectPayload(disconnectPayload));

    await expect(async () => {
      for await (const _payload of conn.receivePayloads()) {
        void _payload;
      }
    }).rejects.toThrow(ConnectionError);
  });

  it("rejects connect() when AbortSignal is already aborted", async () => {
    const [clientSocket, serverSocket] = await waitForConnection(server, serverPort);
    openSockets.push(clientSocket, serverSocket);

    const controller = new AbortController();
    controller.abort();

    const conn = new SshTransportConnection({
      abortSignal: controller.signal,
      algorithms: CLIENT_ALGOS,
    });
    await expect(conn.connect(clientSocket)).rejects.toThrow(ConnectionError);
  });

  it("sendPayload throws before connect()", () => {
    const conn = new SshTransportConnection();
    expect(() => conn.sendPayload(Buffer.from([42]))).toThrow(ProtocolError);
  });

  it("rejects connect() when handshakeTimeoutMs elapses without server bytes", async () => {
    const [clientSocket, serverSocket] = await waitForConnection(server, serverPort);
    openSockets.push(clientSocket, serverSocket);

    // Server accepts but never sends anything — the handshake should time out.
    const conn = new SshTransportConnection({
      algorithms: CLIENT_ALGOS,
      handshakeTimeoutMs: 50,
    });
    const start = Date.now();
    await expect(conn.connect(clientSocket)).rejects.toThrow(/handshake did not complete/i);
    expect(Date.now() - start).toBeLessThan(2000);
    expect(clientSocket.destroyed).toBe(true);
  });

  it("emits SSH_MSG_IGNORE keepalives on idle when keepaliveIntervalMs is set", async () => {
    const [clientSocket, serverSocket] = await waitForConnection(server, serverPort);
    openSockets.push(clientSocket, serverSocket);

    const handshakePromise = runFakeServerHandshake(serverSocket);
    const conn = new SshTransportConnection({
      algorithms: CLIENT_ALGOS,
      keepaliveIntervalMs: 30,
    });
    await conn.connect(clientSocket);
    const { protection } = await handshakePromise;

    // Drain inbound keepalives. They are SSH_MSG_IGNORE (type 2) which the
    // transport drops silently — receivePayloads() never yields them — so we
    // intercept on the server side instead.
    let ignoreCount = 0;
    serverSocket.on("data", (chunk: Buffer | string) => {
      const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      try {
        for (const payload of protection.inbound.pushBytes(buffer)) {
          if (payload[0] === 2) ignoreCount++;
        }
      } catch {
        // ignore decode failures during teardown
      }
    });

    await new Promise((r) => setTimeout(r, 110));
    conn.disconnect();
    expect(ignoreCount).toBeGreaterThanOrEqual(2);
  });
});
