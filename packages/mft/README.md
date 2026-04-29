# @zero-transfer/mft

> Routes, schedules, audit logs, webhooks, approval gates.

## Install

```bash
npm install @zero-transfer/mft
```

## Overview

Managed File Transfer workflow primitives: routes, schedules (interval + cron), inbox/outbox conventions, retention policies, audit logs (in-memory, JSONL, fan-out, webhook-backed), HMAC-signed webhook delivery, and approval gates that require human sign-off before a scheduled run executes.

## Usage

```ts
import { MftRoute, RouteRegistry, runRoute } from "@zero-transfer/mft";
```

## Public surface

This package narrows [`@zero-transfer/sdk`](https://www.npmjs.com/package/@zero-transfer/sdk) to **30** exports. Every symbol is re-exported from the SDK; the table below links into the full API reference:

| Symbol                                                                                                                          | Kind      | Notes              |
| ------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| [`MftRoute`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/MftRoute.md)                          | Interface | See API reference. |
| [`RouteRegistry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/RouteRegistry.md)                   | Class     | See API reference. |
| [`runRoute`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/runRoute.md)                           | Function  | See API reference. |
| [`MftSchedule`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/MftSchedule.md)                    | Interface | See API reference. |
| [`ScheduleRegistry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/ScheduleRegistry.md)             | Class     | See API reference. |
| [`MftScheduler`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/MftScheduler.md)                     | Class     | See API reference. |
| [`parseCronExpression`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/parseCronExpression.md)     | Function  | See API reference. |
| [`nextScheduleFireAt`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/nextScheduleFireAt.md)       | Function  | See API reference. |
| [`createInboxRoute`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createInboxRoute.md)           | Function  | See API reference. |
| [`createOutboxRoute`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createOutboxRoute.md)         | Function  | See API reference. |
| [`inboxProcessedPath`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/inboxProcessedPath.md)       | Function  | See API reference. |
| [`inboxFailedPath`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/inboxFailedPath.md)             | Function  | See API reference. |
| [`evaluateRetention`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/evaluateRetention.md)         | Function  | See API reference. |
| [`AgeRetentionPolicy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/AgeRetentionPolicy.md)      | Interface | See API reference. |
| [`CountRetentionPolicy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/CountRetentionPolicy.md)  | Interface | See API reference. |
| [`InMemoryAuditLog`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/InMemoryAuditLog.md)             | Class     | See API reference. |
| [`createJsonlAuditLog`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createJsonlAuditLog.md)     | Function  | See API reference. |
| [`composeAuditLogs`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/composeAuditLogs.md)           | Function  | See API reference. |
| [`freezeReceipt`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/freezeReceipt.md)                 | Function  | See API reference. |
| [`summarizeError`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/summarizeError.md)               | Function  | See API reference. |
| [`MftAuditLog`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/MftAuditLog.md)                    | Interface | See API reference. |
| [`MftAuditEntry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/MftAuditEntry.md)                | Interface | See API reference. |
| [`dispatchWebhook`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/dispatchWebhook.md)             | Function  | See API reference. |
| [`signWebhookPayload`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/signWebhookPayload.md)       | Function  | See API reference. |
| [`createWebhookAuditLog`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createWebhookAuditLog.md) | Function  | See API reference. |
| [`WebhookTarget`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/WebhookTarget.md)                | Interface | See API reference. |
| [`WebhookRetryPolicy`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/interfaces/WebhookRetryPolicy.md)      | Interface | See API reference. |
| [`ApprovalRegistry`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/ApprovalRegistry.md)             | Class     | See API reference. |
| [`createApprovalGate`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/functions/createApprovalGate.md)       | Function  | See API reference. |
| [`ApprovalRejectedError`](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/classes/ApprovalRejectedError.md)   | Class     | See API reference. |

## Examples

| Example                                                                                                                                    | What it shows                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`examples/mft-route.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/mft-route.ts)                                     | Declarative MFT route + cron schedule.                  |
| [`examples/approval-gated-route.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/approval-gated-route.ts)               | Approval gate for sensitive scheduled routes.           |
| [`examples/atomic-deploy-with-rollback.ts`](https://github.com/tonywied17/zero-transfer/blob/main/examples/atomic-deploy-with-rollback.ts) | Atomic blue/green-style deploy with rollback over SFTP. |

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/mft.md)
- [Top-level README](https://github.com/tonywied17/zero-transfer/blob/main/README.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Capability matrix](https://github.com/tonywied17/zero-transfer/blob/main/README.md#capability-matrix)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © [Tony Wiedman](https://github.com/tonywied17)
