---
title: Sessions & operations
description: How TransferClient, TransferSession, and the unified fs facade fit together.
---

A `TransferClient` is the central registry — it owns the provider registry, the connection pool, and any logger / capability overrides. You'll typically create exactly one per process.

```ts
import { createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient();
```

`client.connect(profile)` returns a [`TransferSession`](../../api/interfaces/transfersession/). A session is a live, authenticated handle to one remote system.

```ts
const session = await client.connect(profile);

// Unified filesystem facade.
const entries = await session.fs.list("/inbox");
const stat = await session.fs.stat("/inbox/file.csv");
const stream = await session.fs.openRead("/inbox/file.csv");

// Provider-specific extensions, when available.
if (session.signedUrls) {
  const url = await session.signedUrls.create("/inbox/file.csv", { ttlMs: 60_000 });
}

await session.disconnect();
```

## Connection pooling

`uploadFile`, `downloadFile`, `copyBetween`, `runRoute`, etc. all accept a `client` plus a `profile` (or two profiles) — they look up an existing pooled session or open a new one and reuse it for follow-up operations on the same profile. You usually don't need to call `client.connect()` directly unless you want a session handle for ad-hoc filesystem calls.

## Cancellation

Every long-running operation accepts an `AbortSignal`. You can pass one on the profile (`profile.signal`) or per-operation:

```ts
const ac = new AbortController();
setTimeout(() => ac.abort(), 30_000);

await uploadFile({
  client,
  localPath: "./big.bin",
  destination: { path: "/inbox/big.bin", profile },
  signal: ac.signal,
});
```

Aborting cancels the in-flight transfer, releases the underlying socket, and rejects the promise with a [`ZeroTransferError`](../../api/classes/zerotransfererror/) of code `"aborted"`.

## Errors

All SDK errors derive from [`ZeroTransferError`](../../api/classes/zerotransfererror/), which carries a stable `code`, an optional `cause`, and structured `details`. See [Errors & diagnostics](../../concepts/errors/) for the full taxonomy.
