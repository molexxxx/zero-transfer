import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { ConfigurationError, ParseError } from "../../../../src/errors/ZeroTransferError";
import {
  DEFAULT_SSH_ALGORITHM_PREFERENCES,
  decodeSshKexInitMessage,
  encodeSshKexInitMessage,
} from "../../../../src/protocols/ssh/transport";

describe("SSH KEXINIT codec", () => {
  it("round-trips KEXINIT payload", () => {
    const cookie = Buffer.from(Array.from({ length: 16 }, (_, index) => index));
    const encoded = encodeSshKexInitMessage({
      algorithms: DEFAULT_SSH_ALGORITHM_PREFERENCES,
      cookie,
      firstKexPacketFollows: false,
    });

    const decoded = decodeSshKexInitMessage(encoded);

    expect(decoded.messageType).toBe(20);
    expect(decoded.cookie).toEqual(cookie);
    expect(decoded.kexAlgorithms).toEqual(DEFAULT_SSH_ALGORITHM_PREFERENCES.kexAlgorithms);
    expect(decoded.serverHostKeyAlgorithms).toEqual(
      DEFAULT_SSH_ALGORITHM_PREFERENCES.serverHostKeyAlgorithms,
    );
    expect(decoded.firstKexPacketFollows).toBe(false);
    expect(decoded.reserved).toBe(0);
  });

  it("rejects invalid cookie lengths", () => {
    expect(() =>
      encodeSshKexInitMessage({
        algorithms: DEFAULT_SSH_ALGORITHM_PREFERENCES,
        cookie: Buffer.alloc(8),
      }),
    ).toThrow(ConfigurationError);
  });

  it("rejects wrong SSH message types", () => {
    const encoded = encodeSshKexInitMessage({
      algorithms: DEFAULT_SSH_ALGORITHM_PREFERENCES,
      cookie: Buffer.alloc(16, 0xaa),
    });
    encoded[0] = 21;

    expect(() => decodeSshKexInitMessage(encoded)).toThrow(ParseError);
  });
});
