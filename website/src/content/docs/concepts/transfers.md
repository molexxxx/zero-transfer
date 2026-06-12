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

`copyBetween` streams bytes through your machine, which is what lets it work across any provider pair (SFTP to S3, WebDAV to local, …). Backend-native fast paths for same-provider copies are planned but not implemented yet - see the [capability matrix](../../guides/capabilities/) for what each provider advertises today.

## Retries, timeouts, and stall detection

Every execution path - the one-shot helpers, [`runRoute`](../../api/functions/runroute/), [`TransferQueue`](../../api/classes/transferqueue/), and [`TransferEngine.execute`](../../api/classes/transferengine/) - accepts a retry policy and a timeout policy. [`createDefaultRetryPolicy`](../../api/functions/createdefaultretrypolicy/) is the production-ready policy: it retries only failures the SDK marks `retryable`, backs off exponentially with full jitter, honors server `Retry-After` hints on 429/503 responses, and stops once a total elapsed budget is spent.

```ts
import { createDefaultRetryPolicy, uploadFile } from "@zero-transfer/sdk";

await uploadFile({
  client,
  localPath: "./dist/app.tar.gz",
  destination: { path: "/releases/app.tar.gz", profile },
  retry: createDefaultRetryPolicy(),
  timeout: { timeoutMs: 600_000, attemptTimeoutMs: 120_000, stallTimeoutMs: 30_000 },
});
```

Timeouts have two scopes with deliberately different semantics:

- **Job scope** (`timeoutMs`) covers the whole execution including retries. When it fires, the job fails immediately - the retry policy is never consulted.
- **Attempt scope** (`attemptTimeoutMs`, `stallTimeoutMs`) covers a single attempt. The stall watchdog resets on every progress report, so it catches connections that go silent without ever erroring. When either fires, only the active attempt is aborted and the failure flows into the retry policy like any other - a stalled or timed-out attempt is retried with backoff.

The returned [`TransferReceipt`](../../api/interfaces/transferreceipt/) records every attempt, including the error that ended each failed one, so you can see exactly what happened ("attempt 1 stalled, attempt 2 succeeded") without extra instrumentation.

See [`examples/retry-and-timeouts.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/retry-and-timeouts.ts) for a runnable, offline walkthrough of every knob in this section.

### Client-wide defaults

Instead of threading `retry` and `timeout` through every call, set them once on the client. Per-call options always win.

```ts
import { createDefaultRetryPolicy, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [...],
  defaults: {
    retry: createDefaultRetryPolicy(),
    timeout: { stallTimeoutMs: 30_000 },
  },
});
```

Defaults apply to `runRoute`, the one-shot helpers, `TransferQueue` (via its `client` option), and scheduled routes. The `TransferEngine` primitive stays fully explicit - defaults never reach `engine.execute()` directly.

## Checkpoints and resume

Configure `resume` with a checkpoint store and interrupted transfers pick up where they left off - across in-process retries and across process restarts. Checkpoints are keyed by the source and destination provider/path pair, so any job moving the same bytes to the same place can resume prior work, no matter which process started it.

```ts
import { createFileSystemTransferCheckpointStore, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [...],
  defaults: {
    retry: createDefaultRetryPolicy(),
    resume: {
      store: createFileSystemTransferCheckpointStore({ directory: "./.zt-checkpoints" }),
    },
  },
});

// Kill the process mid-transfer and run it again: the transfer resumes from
// the last committed byte instead of restarting.
await downloadFile({ client, source, destination });
```

Safety comes first, speed second:

- The source is fingerprinted (size, mtime, etag) when a checkpoint is written; on resume any mismatch invalidates the checkpoint so a changed source is never spliced onto stale destination bytes. Invalidation also triggers best-effort provider cleanup (for example aborting an orphaned S3 multipart upload).
- Byte-offset checkpoints are sanity-trimmed against the actual destination size before being trusted, and only acknowledged bytes are ever recorded - never bytes merely read or in flight.
- Checkpoints are cleared on success and expire after 7 days (matching S3/Azure uncommitted-upload lifetimes). The filesystem store ([`createFileSystemTransferCheckpointStore`](../../api/functions/createfilesystemtransfercheckpointstore/)) writes atomically with `0600` permissions; [`createMemoryTransferCheckpointStore`](../../api/functions/creatememorytransfercheckpointstore/) covers in-process retry and tests.

Two checkpoint shapes cover every provider: sequential-append providers (SFTP, FTP, local) record a committed-byte watermark, while part-based providers (S3 multipart, Azure staged blocks) record the upload token plus the contiguous prefix of completed parts. Resume is capability-gated (`resumeDownload` on the source, `resumeUpload` on the destination); `mode: "require"` makes an incapable pair an error instead of a silent restart, and `mode: "off"` disables checkpoints entirely. See [`TransferResumeOptions`](../../api/interfaces/transferresumeoptions/).

See [`examples/resume-checkpoints.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/resume-checkpoints.ts) for a runnable, offline walkthrough: a transfer whose connection drops mid-stream, retried and resumed from the committed watermark in a single `engine.execute()` call.

### Resumable batch jobs

[`runResumableBatch`](../../api/functions/runresumablebatch/) extends resume from single files to whole plans. Completed steps are recorded in a [`TransferBatchStateStore`](../../api/interfaces/transferbatchstatestore/) as they finish; re-running the same plan skips them, so a crashed thousand-file batch resumes from the first incomplete step - and with byte-level resume on the executor, the interrupted file itself continues from its checkpoint. Plans persist across processes via [`serializeTransferPlan`](../../api/functions/serializetransferplan/) / [`deserializeTransferPlan`](../../api/functions/deserializetransferplan/).

```ts
import {
  createFileSystemTransferBatchStateStore,
  deserializeTransferPlan,
  runResumableBatch,
} from "@zero-transfer/sdk";
import { readFile } from "node:fs/promises";

// The same call works for the first run and every resume after a crash.
const result = await runResumableBatch({
  batchStore: createFileSystemTransferBatchStateStore({ directory: "./.zt-batches" }),
  concurrency: 4,
  executor,
  plan: deserializeTransferPlan(await readFile("./batch.plan.json", "utf8")),
});
console.log(result.complete ? "done" : `${result.remainingStepIds.length} steps left`);
```

See [`examples/resumable-batch.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/resumable-batch.ts) for a runnable, offline walkthrough of a flaky batch resuming across two runs.

## Throughput

Two provider families gained windowed parallelism designed so progress and checkpoints stay monotonic:

- **SFTP pipelining** - single-file reads and writes keep a sliding window of outstanding requests in flight (default 64 requests x 32 KiB = 2 MiB, matching the OpenSSH client). On high-latency links this is the difference between ~320 KiB/s and saturating the path. Chunks still arrive in order, write progress reports only the contiguous acknowledged watermark, and `pipeline: { maxInFlight: 1 }` reproduces the serial behavior. Tune via [`SftpProviderOptions`](../../api/interfaces/sftpprovideroptions/)`.pipeline`.
- **Parallel multipart uploads** - S3 multipart parts and Azure staged blocks upload concurrently (default `partConcurrency: 4`, memory bounded at `(partConcurrency + 1) x partSizeBytes`). Part numbering stays deterministic, finalization is always in part order, and progress/checkpoints advance on the contiguous completed prefix, so parallelism never produces a misleading watermark. `partConcurrency: 1` reproduces the sequential behavior bit-for-bit.

## Memory-bounded streaming

The core transports stream end to end instead of buffering whole files: S3 single-shot uploads with a known size stream with `UNSIGNED-PAYLOAD` SigV4 signing (the same mode presigned URLs use), WebDAV uploads default to chunked streaming (`uploadStreaming: "always"`; legacy servers that reject chunked encoding can opt back into `"when-known-size"`), and FTP directory listings parse incrementally with a bounded per-line size. The SSH/SFTP framers cap declared packet sizes at 256 KiB, matching OpenSSH, so a misbehaving server cannot force unbounded buffering.

The cloud drives stream too: Dropbox uploads use chunked upload sessions (`upload_session/start` + `append_v2` + `finish`, lifting the 150 MB single-request cap), Google Drive and GCS stream through resumable sessions with unknown-size `Content-Range` chunks, and OneDrive streams through Graph upload sessions whenever the total size is known (Graph requires the total in every `Content-Range`; unknown-size OneDrive payloads still buffer). Memory stays bounded at one or two chunks per transfer regardless of file size, and payloads at or below each provider's threshold fall back to the single-shot path automatically.

## Bounded-concurrency queue

[`TransferQueue`](../../api/classes/transferqueue/) runs many transfers with a max-in-flight cap, automatic retry/backoff, and aggregate progress. Pass `client` to seed the queue's retry and timeout policies from the client defaults shown above.

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
