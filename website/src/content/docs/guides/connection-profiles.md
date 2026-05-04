---
title: Connection profiles
description: The provider-neutral ConnectionProfile shape, every SecretSource variant, and the security knobs that matter.
---

Every operation that touches a remote system takes a [`ConnectionProfile`](../../api/interfaces/connectionprofile/). Profiles are provider-neutral data — build one once and pass it to `client.connect()`, `uploadFile()`, `downloadFile()`, `copyBetween()`, MFT routes, and diagnostics. The same shape works for every provider; only the optional auth blocks (`ssh`, `tls`, `oauth`, `s3`, …) change.

## Required fields

| Field      | Type                                          | Notes                                                                                                                                                                                                       |
| ---------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`     | `string`                                      | Remote hostname / IP / bucket / drive identifier (provider-specific). Always required.                                                                                                                      |
| `provider` | [`ProviderId`](../../api/type-aliases/providerid/) | One of `"ftp"`, `"ftps"`, `"sftp"`, `"http"`, `"https"`, `"webdav"`, `"s3"`, `"azure-blob"`, `"gcs"`, `"google-drive"`, `"dropbox"`, `"one-drive"`, `"local"`, `"memory"`, or any custom id you registered. |

## Optional top-level fields

| Field       | Type                                                        | Notes                                                                    |
| ----------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `port`      | `number`                                                    | Provider applies a sensible default when omitted.                        |
| `username`  | [`SecretSource`](../../api/type-aliases/secretsource/)           | String, `{ env }`, `{ path }`, `{ base64Env }`, `{ value }`, callback.   |
| `password`  | [`SecretSource`](../../api/type-aliases/secretsource/)           | Same shapes as `username`. Used as bearer token for cloud providers.     |
| `secure`    | `boolean`                                                   | Request encrypted transport when the protocol allows opt-in TLS.         |
| `tls`       | [`TlsProfile`](../../api/interfaces/tlsprofile/)                 | CA bundle, mTLS cert/key, fingerprint pinning, min/max TLS version.      |
| `ssh`       | [`SshProfile`](../../api/interfaces/sshprofile/)                 | Private key, passphrase, `known_hosts`, host-key pin, agent, algorithms. |
| `timeoutMs` | `number`                                                    | Connection / operation timeout.                                          |
| `signal`    | `AbortSignal`                                               | Cancels connection setup and long-running operations.                    |
| `logger`    | [`ZeroTransferLogger`](../../api/interfaces/zerotransferlogger/) | Per-profile structured logger override (still redaction-safe).           |

## Secret-bearing fields use `SecretSource`

Every credential field (`username`, `password`, `tls.ca`, `tls.key`, `ssh.privateKey`, `ssh.knownHosts`, `ssh.passphrase`, …) accepts a [`SecretSource`](../../api/type-aliases/secretsource/). Inline strings work for prototypes, but production code should pull from the environment, a file, or a callback so secrets stay out of source control and out of process memory dumps.

```ts
// Inline string — fine for tests, avoid in production.
password: "hunter2";

// Read from an environment variable.
password: {
  env: "SFTP_PASSWORD";
}

// Read from a file (e.g. a Docker / Kubernetes secret mount).
privateKey: {
  path: "/run/secrets/sftp_id_ed25519";
}

// Read base64-encoded binary from an environment variable.
ca: {
  base64Env: "FTPS_CA_BUNDLE_B64";
}

// Pull from your vault / credential broker on demand.
password: async () => await vault.read("kv/sftp/deploy");
```

Profiles are run through [`redactConnectionProfile()`](../../api/functions/redactconnectionprofile/) before any log line is emitted, so secret values never appear in logs, audit entries, or diagnostics.

## Worked examples

### SFTP with public-key auth + host-key pin

```ts
const sftp: ConnectionProfile = {
  host: "sftp.example.com",
  provider: "sftp",
  username: "deploy",
  ssh: {
    privateKey: { path: "./keys/id_ed25519" },
    pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
  },
};
```

### FTPS with mTLS and a private CA bundle

```ts
const ftps: ConnectionProfile = {
  host: "ftps.internal.example",
  provider: "ftps",
  username: "audit",
  tls: {
    ca: { path: "./certs/ca-bundle.pem" },
    cert: { path: "./certs/client.crt" },
    key: { path: "./certs/client.key" },
    pinnedFingerprint256:
      "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
  },
};
```

### S3-compatible bucket

```ts
const s3: ConnectionProfile = {
  host: "data-lake-bronze",
  provider: "s3",
  username: { env: "AWS_ACCESS_KEY_ID" },
  password: { env: "AWS_SECRET_ACCESS_KEY" },
};
```

### Cloud drive (OAuth bearer token)

```ts
const dropbox: ConnectionProfile = {
  host: "",
  provider: "dropbox",
  password: { env: "DROPBOX_ACCESS_TOKEN" },
};
```

## Security guidance

- **Pin host keys for SSH/SFTP.** Without `ssh.knownHosts` or `ssh.pinnedHostKeySha256` the SSH session accepts any key the server presents — a MITM risk.
- **Pin TLS fingerprints when you control the server.** `tls.pinnedFingerprint256` is defence-in-depth on top of `rejectUnauthorized: true` and a CA bundle.
- **Never set `tls.rejectUnauthorized: false` in production.** Pair self-signed servers with `tls.ca` instead.
- **Prefer `{ env }`, `{ path }`, or callback secrets** over inline strings or hard-coded values.
- **Treat profiles as sensitive.** Even with auto-redaction in logs, don't serialise raw profiles to disk or send them across the wire unless you've stripped secrets first.

## Full per-field reference

- [`ConnectionProfile`](../../api/interfaces/connectionprofile/)
- [`SshProfile`](../../api/interfaces/sshprofile/)
- [`TlsProfile`](../../api/interfaces/tlsprofile/)
- [`SecretSource`](../../api/type-aliases/secretsource/)
- [`ProviderId`](../../api/type-aliases/providerid/)
