---
title: MFT routes
description: Compose transfers into routes, schedules, approvals, and audit logs.
---

The MFT (Managed File Transfer) layer is for production orchestration - not just "upload one file" but "run this defined transfer on a schedule, with approvals and audit trail."

## Routes

A `Route` is a named, declarative unit of work. It binds a source profile + path, a destination profile + path, options (transform, filter, retry, etc.), and metadata.

```ts
import { type Route } from "@zero-transfer/sdk";

const route: Route = {
  id: "sftp-to-s3-nightly",
  source: { profile: sftpProfile, rootPath: "/inbox" },
  destination: { profile: s3Profile, rootPath: "/raw/inbox" },
  options: { deletePolicy: "preserve" },
};
```

Run one ad-hoc:

```ts
import { runRoute } from "@zero-transfer/sdk";
const receipt = await runRoute({ client, route });
```

## Scheduling

Group routes and schedules into registries, then drive them with [`MftScheduler`](../../api/classes/mftscheduler/):

```ts
import { MftScheduler, RouteRegistry, ScheduleRegistry } from "@zero-transfer/sdk";

const scheduler = new MftScheduler({
  client,
  routes: new RouteRegistry([route]),
  schedules: new ScheduleRegistry([{ id: "nightly", routeId: route.id, cron: "0 2 * * *" }]),
  onResult: ({ receipt }) => console.log(receipt),
});

scheduler.start();
```

## Approval gates

Wrap any runner in [`createApprovalGate`](../../api/functions/createapprovalgate/) to require human approval before bytes move:

```ts
import { ApprovalRegistry, createApprovalGate, runRoute } from "@zero-transfer/sdk";

const approvals = new ApprovalRegistry();
const gatedRunner = createApprovalGate({
  approvalId: ({ route }) => `release:${route.id}:${Date.now()}`,
  registry: approvals,
  runner: ({ client: c, route: r, signal }) => runRoute({ client: c, route: r, signal }),
  timeoutMs: 3_600_000, // optional: fail with ApprovalTimeoutError after 1h pending
});

// Elsewhere: approvals.approve(approvalId) or .reject(approvalId)
```

A rejected request surfaces an [`ApprovalRejectedError`](../../api/classes/approvalrejectederror/); a request that stays pending past `timeoutMs` surfaces an [`ApprovalTimeoutError`](../../api/classes/approvaltimeouterror/) and is auto-rejected with reason `"timeout"`. Omit `timeoutMs` to wait indefinitely.

## Audit logs

[`createWebhookAuditLog`](../../api/functions/createwebhookauditlog/) and other audit-log adapters are passed to the scheduler so every route execution emits a structured, redaction-safe record to your SIEM / webhook / file sink.

Webhook targets must use `https:` - audit payloads and the HMAC signature headers would otherwise cross the network in cleartext. Plain `http:` delivery requires an explicit `allowInsecureUrl: true` opt-in (intended for local development only).

See [`examples/mft-route.ts`](https://github.com/molexxxx/zero-transfer/blob/main/examples/mft-route.ts) and [`examples/approval-gated-route.ts`](https://github.com/molexxxx/zero-transfer/blob/main/examples/approval-gated-route.ts) for runnable end-to-end setups.
