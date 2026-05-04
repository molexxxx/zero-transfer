import { UnsupportedFeatureError } from "../../../errors/ZeroTransferError";

/** Algorithm lists exchanged during SSH KEXINIT negotiation. */
export interface SshAlgorithmPreferences {
  compressionClientToServer: readonly string[];
  compressionServerToClient: readonly string[];
  encryptionClientToServer: readonly string[];
  encryptionServerToClient: readonly string[];
  kexAlgorithms: readonly string[];
  languagesClientToServer: readonly string[];
  languagesServerToClient: readonly string[];
  macClientToServer: readonly string[];
  macServerToClient: readonly string[];
  serverHostKeyAlgorithms: readonly string[];
}

/** Selected algorithms after intersecting client preferences with server capabilities. */
export interface NegotiatedSshAlgorithms {
  compressionClientToServer: string;
  compressionServerToClient: string;
  encryptionClientToServer: string;
  encryptionServerToClient: string;
  kexAlgorithm: string;
  languageClientToServer?: string;
  languageServerToClient?: string;
  macClientToServer: string;
  macServerToClient: string;
  serverHostKeyAlgorithm: string;
}

/**
 * Baseline algorithm order for the initial native SSH transport implementation.
 */
export const DEFAULT_SSH_ALGORITHM_PREFERENCES: Readonly<SshAlgorithmPreferences> = {
  compressionClientToServer: ["none"],
  compressionServerToClient: ["none"],
  encryptionClientToServer: [
    "chacha20-poly1305@openssh.com",
    "aes256-gcm@openssh.com",
    "aes128-gcm@openssh.com",
    "aes256-ctr",
    "aes128-ctr",
  ],
  encryptionServerToClient: [
    "chacha20-poly1305@openssh.com",
    "aes256-gcm@openssh.com",
    "aes128-gcm@openssh.com",
    "aes256-ctr",
    "aes128-ctr",
  ],
  kexAlgorithms: ["curve25519-sha256", "curve25519-sha256@libssh.org"],
  languagesClientToServer: [],
  languagesServerToClient: [],
  macClientToServer: ["hmac-sha2-512", "hmac-sha2-256"],
  macServerToClient: ["hmac-sha2-512", "hmac-sha2-256"],
  serverHostKeyAlgorithms: [
    "ssh-ed25519",
    "ecdsa-sha2-nistp256",
    "ecdsa-sha2-nistp384",
    "ecdsa-sha2-nistp521",
    "rsa-sha2-512",
    "rsa-sha2-256",
  ],
};

/**
 * Intersects client and server algorithm lists using SSH's client-priority selection model.
 */
export function negotiateSshAlgorithms(
  client: SshAlgorithmPreferences,
  server: SshAlgorithmPreferences,
): NegotiatedSshAlgorithms {
  const languageClientToServer = chooseLanguage(
    "languages client->server",
    client.languagesClientToServer,
    server.languagesClientToServer,
  );
  const languageServerToClient = chooseLanguage(
    "languages server->client",
    client.languagesServerToClient,
    server.languagesServerToClient,
  );

  return {
    compressionClientToServer: chooseRequired(
      "compression client->server",
      client.compressionClientToServer,
      server.compressionClientToServer,
    ),
    compressionServerToClient: chooseRequired(
      "compression server->client",
      client.compressionServerToClient,
      server.compressionServerToClient,
    ),
    encryptionClientToServer: chooseRequired(
      "encryption client->server",
      client.encryptionClientToServer,
      server.encryptionClientToServer,
    ),
    encryptionServerToClient: chooseRequired(
      "encryption server->client",
      client.encryptionServerToClient,
      server.encryptionServerToClient,
    ),
    kexAlgorithm: chooseRequired("kex", client.kexAlgorithms, server.kexAlgorithms),
    ...(languageClientToServer === undefined ? {} : { languageClientToServer }),
    ...(languageServerToClient === undefined ? {} : { languageServerToClient }),
    macClientToServer: chooseRequired(
      "mac client->server",
      client.macClientToServer,
      server.macClientToServer,
    ),
    macServerToClient: chooseRequired(
      "mac server->client",
      client.macServerToClient,
      server.macServerToClient,
    ),
    serverHostKeyAlgorithm: chooseRequired(
      "server host key",
      client.serverHostKeyAlgorithms,
      server.serverHostKeyAlgorithms,
    ),
  };
}

function chooseRequired(
  label: string,
  preferred: readonly string[],
  supported: readonly string[],
): string {
  const selected = preferred.find((candidate) => supported.includes(candidate));

  if (selected !== undefined) {
    return selected;
  }

  throw new UnsupportedFeatureError({
    details: {
      preferred,
      supported,
    },
    message: `Unable to negotiate SSH ${label} algorithm`,
    protocol: "sftp",
    retryable: false,
  });
}

function chooseLanguage(
  label: string,
  preferred: readonly string[],
  supported: readonly string[],
): string | undefined {
  if (preferred.length === 0 || supported.length === 0) {
    return undefined;
  }

  return chooseRequired(label, preferred, supported);
}
