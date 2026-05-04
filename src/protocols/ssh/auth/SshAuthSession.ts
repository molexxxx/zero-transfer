/**
 * SSH authentication session (RFC 4252).
 *
 * Drives service-request → USERAUTH exchange over an already-encrypted
 * SshTransportConnection.  Supports:
 *   - none (probes allowed methods, satisfies some servers)
 *   - password
 *   - publickey (query + sign; external signing callback)
 *   - keyboard-interactive (caller supplies responses via callback)
 */
import type { Buffer } from "node:buffer";
import { AuthenticationError } from "../../../errors/ZeroTransferError";
import { SshDataWriter } from "../binary/SshDataWriter";
import {
  SSH_MSG_USERAUTH_BANNER,
  SSH_MSG_USERAUTH_FAILURE,
  SSH_MSG_USERAUTH_INFO_REQUEST,
  SSH_MSG_USERAUTH_PK_OK,
  SSH_MSG_USERAUTH_SUCCESS,
  buildPublickeySignData,
  decodeSshServiceAccept,
  decodeSshUserauthBanner,
  decodeSshUserauthFailure,
  decodeSshUserauthInfoRequest,
  decodeSshUserauthPkOk,
  encodeUserauthRequestPassword,
  encodeUserauthRequestPublickeyQuery,
  encodeUserauthRequestPublickeySign,
  encodeSshServiceRequest,
  encodeSshUserauthInfoResponse,
} from "./SshAuthMessages";
import type { SshTransportConnection } from "../transport/SshTransportConnection";

const SSH_USERAUTH_SERVICE = "ssh-userauth";
const SSH_CONNECTION_SERVICE = "ssh-connection";

// -- Credential shapes --------------------------------------------------------

export interface SshPasswordCredential {
  type: "password";
  username: string;
  password: string;
}

export interface SshPublickeyCredential {
  type: "publickey";
  username: string;
  algorithmName: string;
  /** Raw public key blob in SSH wire format (e.g. the bytes returned by ssh-keygen -e -f key.pub). */
  publicKeyBlob: Uint8Array;
  /**
   * Signs the challenge data.  The data is already the complete sign-data per RFC 4252 §7.
   * Should return the signature blob (without algorithm prefix; caller adds wrapping).
   */
  sign: (data: Uint8Array) => Promise<Uint8Array> | Uint8Array;
}

export interface SshKeyboardInteractiveCredential {
  type: "keyboard-interactive";
  username: string;
  /**
   * Called for each INFO_REQUEST round.  Return one string per prompt in order.
   */
  respond: (
    name: string,
    instruction: string,
    prompts: Array<{ echo: boolean; prompt: string }>,
  ) => Promise<string[]> | string[];
}

export type SshCredential =
  | SshPasswordCredential
  | SshPublickeyCredential
  | SshKeyboardInteractiveCredential;

export interface SshAuthOptions {
  credential: SshCredential;
  /** SSH session id (exchange hash) from key exchange — required for publickey signing. */
  sessionId: Uint8Array;
  /** Maximum number of USERAUTH_FAILURE retries before giving up. Defaults to 4. */
  maxAttempts?: number;
}

export interface SshAuthResult {
  /** Banner lines received from the server during authentication. */
  bannerLines: string[];
  /** Auth method that succeeded. */
  method: string;
}

/**
 * Runs SSH user authentication over an encrypted transport connection.
 *
 * Call this after `SshTransportConnection.connect()` completes.
 * Returns a generator of inbound payloads for the upper (connection) layer to consume.
 * Resolves with an `SshAuthResult` on success; throws `AuthenticationError` on failure.
 */
export class SshAuthSession {
  constructor(private readonly transport: SshTransportConnection) {}

  async authenticate(options: SshAuthOptions): Promise<SshAuthResult> {
    const { credential, sessionId, maxAttempts = 4 } = options;
    const bannerLines: string[] = [];

    // 1. Request the ssh-userauth service.
    this.transport.sendPayload(encodeSshServiceRequest(SSH_USERAUTH_SERVICE));

    // Wait for SERVICE_ACCEPT.
    const serviceAcceptPayload = await this.nextPayload();
    decodeSshServiceAccept(serviceAcceptPayload);

    // 2. Run the auth exchange.
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts += 1;

      const method = credential.type;

      switch (credential.type) {
        case "password": {
          this.transport.sendPayload(
            encodeUserauthRequestPassword({
              password: credential.password,
              serviceName: SSH_CONNECTION_SERVICE,
              username: credential.username,
            }),
          );
          break;
        }

        case "publickey": {
          // Phase 1: query whether server accepts this key.
          this.transport.sendPayload(
            encodeUserauthRequestPublickeyQuery({
              algorithmName: credential.algorithmName,
              publicKeyBlob: credential.publicKeyBlob,
              serviceName: SSH_CONNECTION_SERVICE,
              username: credential.username,
            }),
          );

          const queryResponse = await this.nextPayloadSkippingBanners(bannerLines);
          const queryMsgType = queryResponse[0];

          if (queryMsgType === SSH_MSG_USERAUTH_FAILURE) {
            const failure = decodeSshUserauthFailure(queryResponse);
            throw new AuthenticationError({
              details: { allowed: failure.allowedAuthentications },
              message: `SSH server does not accept public key for user "${credential.username}"`,
              protocol: "sftp",
              retryable: false,
            });
          }

          if (queryMsgType !== SSH_MSG_USERAUTH_PK_OK) {
            throw new AuthenticationError({
              details: { msgType: queryMsgType },
              message: "Unexpected server response to publickey query",
              protocol: "sftp",
              retryable: false,
            });
          }

          decodeSshUserauthPkOk(queryResponse); // validates structure

          // Phase 2: sign and send.
          const signData = buildPublickeySignData({
            algorithmName: credential.algorithmName,
            publicKeyBlob: credential.publicKeyBlob,
            serviceName: SSH_CONNECTION_SERVICE,
            sessionId,
            username: credential.username,
          });

          const rawSignature = await credential.sign(signData);
          const signatureBlob = buildSignatureBlob(credential.algorithmName, rawSignature);

          this.transport.sendPayload(
            encodeUserauthRequestPublickeySign({
              algorithmName: credential.algorithmName,
              publicKeyBlob: credential.publicKeyBlob,
              serviceName: SSH_CONNECTION_SERVICE,
              signature: signatureBlob,
              username: credential.username,
            }),
          );
          break;
        }

        case "keyboard-interactive": {
          // RFC 4256 §3.1: send the keyboard-interactive USERAUTH_REQUEST
          // directly. The server then drives one or more INFO_REQUEST rounds.
          await this.runKeyboardInteractiveRounds(credential, bannerLines);
          const kiResult = await this.nextPayloadSkippingBanners(bannerLines);
          if (kiResult[0] === SSH_MSG_USERAUTH_SUCCESS) {
            return { bannerLines, method: "keyboard-interactive" };
          }
          if (kiResult[0] === SSH_MSG_USERAUTH_FAILURE) {
            throw new AuthenticationError({
              details: { allowed: decodeSshUserauthFailure(kiResult).allowedAuthentications },
              message: `SSH keyboard-interactive authentication failed for user "${credential.username}"`,
              protocol: "sftp",
              retryable: false,
            });
          }
          throw new AuthenticationError({
            details: { msgType: kiResult[0] },
            message: "Unexpected message type after keyboard-interactive exchange",
            protocol: "sftp",
            retryable: false,
          });
        }
      }

      const response = await this.nextPayloadSkippingBanners(bannerLines);
      const responseMsgType = response[0];

      if (responseMsgType === SSH_MSG_USERAUTH_SUCCESS) {
        return { bannerLines, method };
      }

      if (responseMsgType === SSH_MSG_USERAUTH_FAILURE) {
        const failure = decodeSshUserauthFailure(response);

        if (attempts >= maxAttempts || !failure.allowedAuthentications.includes(credential.type)) {
          throw new AuthenticationError({
            details: { allowed: failure.allowedAuthentications, attempts },
            message: `SSH authentication failed for user "${credential.username}" after ${attempts} attempt(s)`,
            protocol: "sftp",
            retryable: false,
          });
        }

        // Server rejected this attempt but allows retry — loop.
        continue;
      }

      throw new AuthenticationError({
        details: { msgType: responseMsgType },
        message: "Unexpected message type during SSH authentication",
        protocol: "sftp",
        retryable: false,
      });
    }

    throw new AuthenticationError({
      details: { maxAttempts },
      message: `SSH authentication exceeded maximum attempts (${maxAttempts})`,
      protocol: "sftp",
      retryable: false,
    });
  }

  // -- Private helpers ------------------------------------------------------

  private async runKeyboardInteractiveRounds(
    credential: SshKeyboardInteractiveCredential,
    bannerLines: string[],
  ): Promise<void> {
    // Send the keyboard-interactive auth request now that we know the server accepts it.
    this.transport.sendPayload(
      buildKiRequest({ serviceName: SSH_CONNECTION_SERVICE, username: credential.username }),
    );

    while (true) {
      const payload = await this.nextPayloadSkippingBanners(bannerLines);
      const msgType = payload[0];

      if (msgType === SSH_MSG_USERAUTH_INFO_REQUEST) {
        const infoReq = decodeSshUserauthInfoRequest(payload);
        const responses = await credential.respond(
          infoReq.name,
          infoReq.instruction,
          infoReq.prompts,
        );
        this.transport.sendPayload(encodeSshUserauthInfoResponse(responses));
        continue;
      }

      // Put the payload back in the caller's view by re-emitting — handled by returning.
      this.pendingPayload = payload;
      return;
    }
  }

  private pendingPayload: Buffer | undefined;

  private async nextPayload(): Promise<Buffer> {
    if (this.pendingPayload !== undefined) {
      const p = this.pendingPayload;
      this.pendingPayload = undefined;
      return p;
    }
    const result = await this.transport.receivePayloads().next();
    if (result.done === true) {
      throw new AuthenticationError({
        message: "SSH connection closed during authentication",
        protocol: "sftp",
        retryable: false,
      });
    }
    return result.value;
  }

  private async nextPayloadSkippingBanners(bannerLines: string[]): Promise<Buffer> {
    while (true) {
      const payload = await this.nextPayload();
      if (payload[0] === SSH_MSG_USERAUTH_BANNER) {
        bannerLines.push(decodeSshUserauthBanner(payload).message);
        continue;
      }
      return payload;
    }
  }
}

// -- Helpers ------------------------------------------------------------------

/**
 * Wraps a raw signature value in an SSH "sig" blob:
 *   string  algorithm-name
 *   string  signature-bytes
 */
function buildSignatureBlob(algorithmName: string, rawSignature: Uint8Array): Buffer {
  return new SshDataWriter()
    .writeString(algorithmName, "ascii")
    .writeString(rawSignature)
    .toBuffer();
}

/**
 * Encodes keyboard-interactive USERAUTH_REQUEST (RFC 4256 §3.1).
 */
function buildKiRequest(args: { serviceName: string; username: string }): Buffer {
  return new SshDataWriter()
    .writeByte(50) // SSH_MSG_USERAUTH_REQUEST
    .writeString(args.username, "utf8")
    .writeString(args.serviceName, "utf8")
    .writeString("keyboard-interactive", "ascii")
    .writeString("", "utf8") // language tag (deprecated, empty)
    .writeString("", "utf8") // submethods (empty = server chooses)
    .toBuffer();
}
