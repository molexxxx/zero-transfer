import { ParseError } from "../../../errors/ZeroTransferError";

export const SSH_MSG_NEWKEYS = 21;

/**
 * Encodes an SSH_MSG_NEWKEYS payload.
 */
export function encodeSshNewKeysMessage(): Buffer {
  return Buffer.from([SSH_MSG_NEWKEYS]);
}

/**
 * Validates and decodes an SSH_MSG_NEWKEYS payload.
 */
export function decodeSshNewKeysMessage(payload: Uint8Array): { messageType: number } {
  if (payload.length !== 1 || payload[0] !== SSH_MSG_NEWKEYS) {
    throw new ParseError({
      details: { length: payload.length, messageType: payload[0] },
      message: "Expected SSH_MSG_NEWKEYS payload",
      protocol: "sftp",
      retryable: false,
    });
  }

  return { messageType: SSH_MSG_NEWKEYS };
}
