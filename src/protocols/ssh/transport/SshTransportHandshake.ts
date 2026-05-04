import { Buffer } from "node:buffer";
import { ParseError, ProtocolError } from "../../../errors/ZeroTransferError";
import type { NegotiatedSshAlgorithms, SshAlgorithmPreferences } from "./SshAlgorithmNegotiation";
import {
  DEFAULT_SSH_ALGORITHM_PREFERENCES,
  negotiateSshAlgorithms,
} from "./SshAlgorithmNegotiation";
import {
  buildSshIdentificationLine,
  parseSshIdentificationLine,
  type SshIdentification,
} from "./SshIdentification";
import {
  decodeSshKexInitMessage,
  encodeSshKexInitMessage,
  type SshKexInitMessage,
} from "./SshKexInit";
import {
  createCurve25519Ephemeral,
  decodeSshKexEcdhReplyMessage,
  encodeSshKexEcdhInitMessage,
} from "./SshKexCurve25519";
import { deriveSshSessionKeys, type SshDerivedSessionKeys } from "./SshKeyDerivation";
import { decodeSshNewKeysMessage, encodeSshNewKeysMessage } from "./SshNewKeys";
import { SshTransportPacketFramer, encodeSshTransportPacket } from "./SshTransportPacket";
import { verifySshHostKeySignature } from "./SshHostKeyVerification";

/** Initial client-side handshake state before key exchange math starts. */
export interface SshTransportHandshakeResult {
  keyExchange: {
    algorithm: string;
    clientKexInitPayload: Buffer;
    clientPublicKey: Buffer;
    exchangeHash: Buffer;
    serverHostKey: Buffer;
    serverKexInitPayload: Buffer;
    serverPublicKey: Buffer;
    serverSignature: Buffer;
    sessionId: Buffer;
    sharedSecret: Buffer;
    transportKeys: {
      clientToServer: SshDerivedSessionKeys["clientToServer"];
      serverToClient: SshDerivedSessionKeys["serverToClient"];
    };
  };
  negotiatedAlgorithms: NegotiatedSshAlgorithms;
  serverIdentification: SshIdentification;
  serverKexInit: SshKexInitMessage;
  /**
   * Number of unencrypted packets the client sent during the handshake (KEXINIT,
   * KEX_ECDH_INIT, NEWKEYS). Per RFC 4253 §6.4, packet sequence numbers are never
   * reset across NEWKEYS, so this value seeds the outbound protector.
   */
  outboundPacketCount: number;
  /**
   * Number of unencrypted packets the client received from the server during the
   * handshake (server KEXINIT, KEX_ECDH_REPLY, NEWKEYS). Seeds the inbound unprotector.
   */
  inboundPacketCount: number;
}

type HandshakePhase =
  | "awaiting-server-identification"
  | "awaiting-server-kexinit"
  | "awaiting-server-kexreply"
  | "awaiting-server-newkeys"
  | "complete";

/**
 * Client-side SSH handshake coordinator for version exchange and KEXINIT negotiation.
 */
export class SshTransportHandshake {
  private readonly clientAlgorithms: SshAlgorithmPreferences;
  private readonly clientIdentificationLine: string;
  private readonly clientKexInitPayload: Buffer;
  private readonly identificationLines: string[] = [];
  private readonly packetFramer = new SshTransportPacketFramer();
  private readonly pendingIdentification = new SshIdentificationAccumulator();
  private phase: HandshakePhase = "awaiting-server-identification";
  private inboundPacketCount = 0;
  private outboundPacketCount = 0;
  private pendingCurve25519:
    | {
        deriveSharedSecret: (serverPublicKey: Uint8Array) => Buffer;
        publicKey: Buffer;
      }
    | undefined;
  private pendingKeyExchange:
    | {
        clientIdentification: string;
        algorithm: string;
        clientKexInitPayload: Buffer;
        clientPublicKey: Buffer;
        serverHostKey: Buffer;
        serverIdentification: string;
        serverKexInitPayload: Buffer;
        serverPublicKey: Buffer;
        serverSignature: Buffer;
        sharedSecret: Buffer;
        negotiatedAlgorithms: NegotiatedSshAlgorithms;
      }
    | undefined;
  private serverIdentification: SshIdentification | undefined;

  constructor(
    private readonly options: {
      algorithms?: SshAlgorithmPreferences;
      clientComments?: string;
      clientSoftwareVersion?: string;
      kexCookie?: Uint8Array;
      /**
       * Verifies the server's host key after the signature check passes.
       * Receives the SSH wire-format host key blob and its SHA-256 digest.
       * Throwing rejects the handshake; resolving accepts it.
       *
       * If omitted, the host key is accepted as long as its signature over the
       * exchange hash verifies. Callers SHOULD supply this hook in production
       * to enforce known_hosts or pinned-fingerprint policies.
       */
      verifyHostKey?: (input: {
        hostKeyBlob: Buffer;
        hostKeySha256: Buffer;
        algorithmName: string;
      }) => void | Promise<void>;
    } = {},
  ) {
    this.clientAlgorithms = options.algorithms ?? DEFAULT_SSH_ALGORITHM_PREFERENCES;
    this.clientIdentificationLine = buildSshIdentificationLine({
      ...(options.clientComments === undefined ? {} : { comments: options.clientComments }),
      softwareVersion: options.clientSoftwareVersion ?? "ZeroTransfer_Dev",
    });
    this.clientKexInitPayload = encodeSshKexInitMessage({
      algorithms: this.clientAlgorithms,
      ...(options.kexCookie === undefined ? {} : { cookie: options.kexCookie }),
    });
  }

  /** Creates the first outbound bytes (client identification line). */
  createInitialClientBytes(): Buffer {
    return Buffer.from(`${this.clientIdentificationLine}\r\n`, "ascii");
  }

  /**
   * Feeds raw server bytes into the handshake state machine.
   */
  pushServerBytes(chunk: Uint8Array): {
    outbound: Buffer[];
    result?: SshTransportHandshakeResult;
  } {
    const outbound: Buffer[] = [];

    if (this.phase === "awaiting-server-identification") {
      const scan = this.pendingIdentification.push(chunk);
      for (const banner of scan.bannerLines) {
        this.identificationLines.push(banner);
      }

      if (scan.identLine !== undefined) {
        this.serverIdentification = parseSshIdentificationLine(scan.identLine);
        this.phase = "awaiting-server-kexinit";
        outbound.push(encodeSshTransportPacket(this.clientKexInitPayload));
        this.outboundPacketCount += 1;

        if (scan.remainder.length > 0) {
          return this.pushServerBytesWithPhase(outbound, scan.remainder);
        }
      }

      return { outbound };
    }

    return this.pushServerBytesWithPhase(outbound, Buffer.from(chunk));
  }

  getServerBannerLines(): readonly string[] {
    return this.identificationLines;
  }

  isComplete(): boolean {
    return this.phase === "complete";
  }

  /**
   * Returns any bytes received after the last complete handshake packet and clears the buffer.
   * Call this once after `pushServerBytes` returns a result to drain bytes that belong to the
   * post-NEWKEYS encrypted phase but arrived in the same TCP segment as NEWKEYS.
   */
  takeRemainingBytes(): Buffer {
    return this.packetFramer.takeRemainingBytes();
  }

  private pushServerBytesWithPhase(
    outbound: Buffer[],
    chunk: Uint8Array,
  ): {
    outbound: Buffer[];
    result?: SshTransportHandshakeResult;
  } {
    if (this.phase === "awaiting-server-identification") {
      return { outbound };
    }

    for (const packet of this.packetFramer.push(chunk)) {
      const messageType = packet.payload[0];
      this.inboundPacketCount += 1;

      if (this.phase === "awaiting-server-kexinit") {
        if (messageType !== 20) {
          throw new ProtocolError({
            details: { messageType },
            message: "Expected SSH_MSG_KEXINIT from server during initial handshake",
            protocol: "sftp",
            retryable: false,
          });
        }

        const serverKexInit = decodeSshKexInitMessage(packet.payload);
        const negotiatedAlgorithms = negotiateSshAlgorithms(this.clientAlgorithms, serverKexInit);

        if (
          negotiatedAlgorithms.kexAlgorithm !== "curve25519-sha256" &&
          negotiatedAlgorithms.kexAlgorithm !== "curve25519-sha256@libssh.org"
        ) {
          throw new ProtocolError({
            details: { kexAlgorithm: negotiatedAlgorithms.kexAlgorithm },
            message: "Native SSH transport currently supports only Curve25519 key exchange",
            protocol: "sftp",
            retryable: false,
          });
        }

        this.pendingCurve25519 = createCurve25519Ephemeral();
        this.phase = "awaiting-server-kexreply";
        outbound.push(
          encodeSshTransportPacket(encodeSshKexEcdhInitMessage(this.pendingCurve25519.publicKey)),
        );
        this.outboundPacketCount += 1;

        // Preserve KEXINIT artifacts required for exchange hash in the next wave.
        this.pendingKeyExchange = {
          clientIdentification: this.clientIdentificationLine,
          algorithm: negotiatedAlgorithms.kexAlgorithm,
          clientKexInitPayload: this.clientKexInitPayload,
          clientPublicKey: this.pendingCurve25519.publicKey,
          negotiatedAlgorithms,
          serverHostKey: Buffer.alloc(0),
          serverIdentification: (this.serverIdentification ?? missingServerIdentificationError())
            .raw,
          serverKexInitPayload: Buffer.from(packet.payload),
          serverPublicKey: Buffer.alloc(0),
          serverSignature: Buffer.alloc(0),
          sharedSecret: Buffer.alloc(0),
        };

        continue;
      }

      if (this.phase === "awaiting-server-kexreply") {
        if (messageType !== 31) {
          throw new ProtocolError({
            details: { messageType },
            message: "Expected SSH_MSG_KEX_ECDH_REPLY from server",
            protocol: "sftp",
            retryable: false,
          });
        }

        if (this.pendingCurve25519 === undefined || this.pendingKeyExchange === undefined) {
          throw new ProtocolError({
            message:
              "Curve25519 client key state missing while processing server key exchange reply",
            protocol: "sftp",
            retryable: false,
          });
        }

        const reply = decodeSshKexEcdhReplyMessage(packet.payload);
        const sharedSecret = this.pendingCurve25519.deriveSharedSecret(reply.serverPublicKey);

        this.pendingKeyExchange = {
          ...this.pendingKeyExchange,
          serverHostKey: reply.hostKey,
          serverPublicKey: reply.serverPublicKey,
          serverSignature: reply.signature,
          sharedSecret,
        };

        this.phase = "awaiting-server-newkeys";
        outbound.push(encodeSshTransportPacket(encodeSshNewKeysMessage()));
        this.outboundPacketCount += 1;
        continue;
      }

      if (this.phase === "awaiting-server-newkeys") {
        decodeSshNewKeysMessage(packet.payload);

        const keyExchange = this.pendingKeyExchange ?? missingPendingKeyExchangeError();
        const derivedKeys = deriveSshSessionKeys({
          clientIdentification: keyExchange.clientIdentification,
          clientKexInitPayload: keyExchange.clientKexInitPayload,
          clientPublicKey: keyExchange.clientPublicKey,
          kexAlgorithm: keyExchange.algorithm,
          negotiatedAlgorithms: keyExchange.negotiatedAlgorithms,
          serverHostKey: keyExchange.serverHostKey,
          serverIdentification: keyExchange.serverIdentification,
          serverKexInitPayload: keyExchange.serverKexInitPayload,
          serverPublicKey: keyExchange.serverPublicKey,
          sharedSecret: keyExchange.sharedSecret,
        });

        // RFC 4253 §8: the client MUST verify the host key signature over the
        // exchange hash before transitioning to the encrypted phase. Without
        // this check the entire transport is open to a man-in-the-middle.
        const hostKeyVerification = verifySshHostKeySignature({
          exchangeHash: derivedKeys.exchangeHash,
          hostKeyBlob: keyExchange.serverHostKey,
          signatureBlob: keyExchange.serverSignature,
        });

        // Optional caller-supplied policy gate (known_hosts, pinned fingerprint, …).
        const verifyHook = this.options.verifyHostKey;
        if (verifyHook !== undefined) {
          // The hook may throw to reject; we surface that as a ProtocolError below.
          // Promise-returning hooks are not awaited inside this synchronous
          // state machine — callers requiring async policy must perform it
          // before initiating connect().
          const maybe = verifyHook({
            algorithmName: hostKeyVerification.algorithmName,
            hostKeyBlob: keyExchange.serverHostKey,
            hostKeySha256: hostKeyVerification.hostKeySha256,
          });
          if (maybe instanceof Promise) {
            throw new ProtocolError({
              message:
                "verifyHostKey must be synchronous; perform any async lookups before calling connect()",
              protocol: "sftp",
              retryable: false,
            });
          }
        }

        const serverKexInit = decodeSshKexInitMessage(keyExchange.serverKexInitPayload);
        const result: SshTransportHandshakeResult = {
          keyExchange: {
            algorithm: keyExchange.algorithm,
            clientKexInitPayload: keyExchange.clientKexInitPayload,
            clientPublicKey: keyExchange.clientPublicKey,
            exchangeHash: derivedKeys.exchangeHash,
            serverHostKey: keyExchange.serverHostKey,
            serverKexInitPayload: keyExchange.serverKexInitPayload,
            serverPublicKey: keyExchange.serverPublicKey,
            serverSignature: keyExchange.serverSignature,
            sessionId: derivedKeys.sessionId,
            sharedSecret: keyExchange.sharedSecret,
            transportKeys: {
              clientToServer: derivedKeys.clientToServer,
              serverToClient: derivedKeys.serverToClient,
            },
          },
          negotiatedAlgorithms: keyExchange.negotiatedAlgorithms,
          serverIdentification: this.serverIdentification ?? missingServerIdentificationError(),
          serverKexInit,
          inboundPacketCount: this.inboundPacketCount,
          outboundPacketCount: this.outboundPacketCount,
        };

        this.phase = "complete";
        this.pendingCurve25519 = undefined;
        this.pendingKeyExchange = undefined;
        return { outbound, result };
      }

      throw new ProtocolError({
        details: { phase: this.phase },
        message: "SSH transport handshake received unexpected packets after completion",
        protocol: "sftp",
        retryable: false,
      });
    }

    return { outbound };
  }
}

class SshIdentificationAccumulator {
  private pending = Buffer.alloc(0);

  push(chunk: Uint8Array): { bannerLines: string[]; identLine?: string; remainder: Buffer } {
    this.pending = Buffer.concat([this.pending, Buffer.from(chunk)]);
    const bannerLines: string[] = [];

    while (true) {
      const lfIndex = this.pending.indexOf(0x0a);
      if (lfIndex < 0) break;

      // Capture the line as text (safe: identification exchange is ASCII-only).
      const lineText = trimLineEndings(this.pending.subarray(0, lfIndex + 1).toString("ascii"));

      // Capture everything AFTER the \n as raw binary before any string conversion.
      const remainder = Buffer.from(this.pending.subarray(lfIndex + 1));
      this.pending = remainder;

      if (lineText.startsWith("SSH-")) {
        // Found the identification line.  Everything in pending is binary packet data.
        this.pending = Buffer.alloc(0);
        return { bannerLines, identLine: lineText, remainder };
      }

      bannerLines.push(lineText);
    }

    return { bannerLines, remainder: Buffer.alloc(0) };
  }
}

function trimLineEndings(value: string): string {
  if (value.endsWith("\r\n")) {
    return value.slice(0, -2);
  }

  if (value.endsWith("\n")) {
    return value.slice(0, -1);
  }

  return value;
}

function missingServerIdentificationError(): never {
  throw new ParseError({
    message: "Missing server SSH identification while negotiating KEXINIT",
    protocol: "sftp",
    retryable: false,
  });
}

function missingPendingKeyExchangeError(): never {
  throw new ProtocolError({
    message: "SSH transport key exchange state was not initialized",
    protocol: "sftp",
    retryable: false,
  });
}
