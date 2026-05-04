import { describe, expect, it } from "vitest";
import { UnsupportedFeatureError } from "../../../../src/errors/ZeroTransferError";
import {
  DEFAULT_SSH_ALGORITHM_PREFERENCES,
  negotiateSshAlgorithms,
  type SshAlgorithmPreferences,
} from "../../../../src/protocols/ssh/transport";

describe("negotiateSshAlgorithms", () => {
  it("selects the first client-preferred overlap for each category", () => {
    const client: SshAlgorithmPreferences = {
      ...DEFAULT_SSH_ALGORITHM_PREFERENCES,
      languagesClientToServer: ["en-US", "fr-FR"],
      languagesServerToClient: ["en-US", "fr-FR"],
    };
    const server: SshAlgorithmPreferences = {
      compressionClientToServer: ["none"],
      compressionServerToClient: ["none"],
      encryptionClientToServer: ["aes128-ctr", "aes256-ctr"],
      encryptionServerToClient: ["aes256-ctr", "aes128-ctr"],
      kexAlgorithms: ["curve25519-sha256@libssh.org", "diffie-hellman-group14-sha256"],
      languagesClientToServer: ["fr-FR"],
      languagesServerToClient: ["fr-FR"],
      macClientToServer: ["hmac-sha2-256"],
      macServerToClient: ["hmac-sha2-256"],
      serverHostKeyAlgorithms: ["rsa-sha2-256", "ssh-ed25519"],
    };

    const negotiated = negotiateSshAlgorithms(client, server);
    expect(negotiated.kexAlgorithm).toBe("curve25519-sha256@libssh.org");
    expect(negotiated.serverHostKeyAlgorithm).toBe("ssh-ed25519");
    expect(negotiated.encryptionClientToServer).toBe("aes256-ctr");
    expect(negotiated.encryptionServerToClient).toBe("aes256-ctr");
    expect(negotiated.languageClientToServer).toBe("fr-FR");
    expect(negotiated.languageServerToClient).toBe("fr-FR");
  });

  it("throws when no required algorithm intersects", () => {
    const client: SshAlgorithmPreferences = {
      ...DEFAULT_SSH_ALGORITHM_PREFERENCES,
      kexAlgorithms: ["curve25519-sha256"],
    };
    const server: SshAlgorithmPreferences = {
      ...DEFAULT_SSH_ALGORITHM_PREFERENCES,
      kexAlgorithms: ["diffie-hellman-group14-sha256"],
    };

    expect(() => negotiateSshAlgorithms(client, server)).toThrow(UnsupportedFeatureError);
  });
});
