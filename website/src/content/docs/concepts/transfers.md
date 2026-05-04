---
title: Transfers & sync
description: One-shot transfers, planning, queues, and tree diffs.
---

The transfer surface is layered so you can pick the abstraction level you need.

## One-shot file transfers

[`uploadFile`](../../api/functions/uploadfile/), [`downloadFile`](../../api/functions/downloadfile/), and [`copyBetween`](../../api/functions/copybetween/) handle the 90% case: move one file, get progress events, fail loudly on errors.

```ts
import { uploadFile } from "@zero-transfer/sdk";

await uploadFile({
  client,
  localPath: "./dist/app.tar.gz",
  destination: { path: "/releases/app.tar.gz", profile },
  onProgress: (e) => console.log(`${e.bytesTransferred}/${e.totalBytes ?? "?"}`),
});
```

When both ends are on the same provider and that provider supports server-side copy, `copyBetween` will use it automatically — no bytes traverse your machine.

## Bounded-concurrency queue

[`TransferQueue`](../../api/classes/transferqueue/) runs many transfers with a max-in-flight cap, automatic retry/backoff, and aggregate progress.

```ts
import { TransferQueue } from "@zero-transfer/sdk";

const queue = new TransferQueue({ client, concurrency: 4 });
for (const file of files) {
  queue.enqueue({
    kind: "upload",
    localPath: file,
    destination: { path: `/inbox/${file}`, profile },
  });
}
const results = await queue.drain();
```

## Tree diffs and sync plans

[`diffRemoteTrees`](../../api/functions/diffremotetrees/) walks two filesystems (any combination of providers) and produces a structural diff. [`createSyncPlan`](../../api/functions/createsyncplan/) turns that diff into an executable plan with a delete policy. [`summarizeTransferPlan`](../../api/functions/summarizetransferplan/) renders a human-readable preview before you commit.

```ts
import { diffRemoteTrees, createSyncPlan, summarizeTransferPlan } from "@zero-transfer/sdk";

const diff = await diffRemoteTrees(srcSession.fs, "/dist", dstSession.fs, "/releases/current");
const plan = createSyncPlan({
  id: "release-sync",
  diff,
  source: { provider: "sftp", rootPath: "/dist" },
  destination: { provider: "s3", rootPath: "/releases/current" },
  deletePolicy: "mirror",
});

console.table(summarizeTransferPlan(plan));
```

## Atomic deploys with rollback

[`createAtomicDeployPlan`](../../api/functions/createatomicdeployplan/) wraps a sync in a stage → swap → rollback pattern: writes go to a staging directory, an atomic rename promotes the new version, and a captured snapshot lets you roll back if validation fails.

See [`examples/atomic-deploy-with-rollback.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/atomic-deploy-with-rollback.ts) for the full recipe.
