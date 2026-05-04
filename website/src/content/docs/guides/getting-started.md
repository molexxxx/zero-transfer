---
title: Getting started
description: Install the SDK, build a connection profile, and run your first transfer.
---

This guide walks you from `npm install` to your first successful upload in under five minutes.

## 1. Requirements

- **Node.js ≥ 20** (the SDK uses native `fetch`, `AbortSignal.timeout`, and modern stream APIs).
- A package manager (`npm`, `pnpm`, or `yarn`).
- Credentials for at least one remote system you want to talk to (SFTP server, S3 bucket, etc.).

## 2. Install

The umbrella package brings every built-in provider:

```bash
npm install @zero-transfer/sdk
```

If you only need one or two providers, use the scoped packages instead — they pull in just that provider's transitive deps:

```bash
npm install @zero-transfer/sftp
npm install @zero-transfer/s3
npm install @zero-transfer/ftps
```

The scoped packages re-export the same `createTransferClient`, `uploadFile`, etc. as the umbrella package, so you can swap between them without code changes.

## 3. Build a connection profile

Every operation that touches a remote system takes a [`ConnectionProfile`](../../api/interfaces/connectionprofile/). The shape is provider-neutral — you describe the destination once and reuse it.

```ts
import type { ConnectionProfile } from "@zero-transfer/sdk";

const sftp: ConnectionProfile = {
  host: "sftp.example.com",
  provider: "sftp",
  username: "deploy",
  ssh: {
    privateKey: { path: "./keys/id_ed25519" },
    // Pin the server's host key — without this the SSH session
    // accepts any key the server presents (MITM risk).
    pinnedHostKeySha256: "SHA256:abc123basesixfourpinFromKnownHosts=",
  },
};
```

For the full field reference and every secret-loading variant, see **[Connection profiles](../../guides/connection-profiles/)**.

## 4. Connect and run an operation

```ts
import { createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient();
const session = await client.connect(sftp);

// `session.fs` is the unified filesystem facade. Same shape on every provider.
const releases = await session.fs.list("/releases");
console.log(releases.map((entry) => entry.name));

await session.disconnect();
```

## 5. Transfer a file

```ts
import { uploadFile } from "@zero-transfer/sdk";

await uploadFile({
  client,
  localPath: "./dist/app.tar.gz",
  destination: { path: "/releases/2026.04.28/app.tar.gz", profile: sftp },
  onProgress: (event) => console.log(`${event.bytesTransferred}/${event.totalBytes ?? "?"} bytes`),
});
```

`uploadFile` reuses any pooled connection bound to that profile, so you don't pay the connect cost twice.

## 6. Where to next

- **[Connection profiles](../../guides/connection-profiles/)** — every field, every secret variant, every security knob.
- **[Capability matrix](../../guides/capabilities/)** — what each provider can and can't do.
- **[Examples](../../guides/examples/)** — runnable end-to-end scripts (sync, MFT, atomic deploy, signed URLs, …).
- **[API reference](../../api/)** — auto-generated from the source.
