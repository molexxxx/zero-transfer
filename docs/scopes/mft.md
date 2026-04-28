# MFT — Managed File Transfer workflows

> Routes, schedules, audit logs, webhooks, approval gates.

## Install

```bash
npm install @zero-transfer/mft
```

## Overview

Managed File Transfer workflow primitives: routes, schedules (interval + cron), inbox/outbox conventions, retention policies, audit logs (in-memory, JSONL, fan-out, webhook-backed), HMAC-signed webhook delivery, and approval gates that require human sign-off before a scheduled run executes.

## Eventual public surface

Today this package re-exports the full [`@zero-transfer/sdk`](../api-md/README.md) so the scope is claimable on npm without breaking consumers. The list below is the eventual surface this package will narrow to:

| Symbol                                                                  | Kind      | Notes              |
| ----------------------------------------------------------------------- | --------- | ------------------ |
| [`MftRoute`](../api-md/interfaces/MftRoute.md)                          | Interface | See API reference. |
| [`RouteRegistry`](../api-md/classes/RouteRegistry.md)                   | Class     | See API reference. |
| [`runRoute`](../api-md/functions/runRoute.md)                           | Function  | See API reference. |
| [`MftSchedule`](../api-md/interfaces/MftSchedule.md)                    | Interface | See API reference. |
| [`ScheduleRegistry`](../api-md/classes/ScheduleRegistry.md)             | Class     | See API reference. |
| [`MftScheduler`](../api-md/classes/MftScheduler.md)                     | Class     | See API reference. |
| [`parseCronExpression`](../api-md/functions/parseCronExpression.md)     | Function  | See API reference. |
| [`nextScheduleFireAt`](../api-md/functions/nextScheduleFireAt.md)       | Function  | See API reference. |
| [`createInboxRoute`](../api-md/functions/createInboxRoute.md)           | Function  | See API reference. |
| [`createOutboxRoute`](../api-md/functions/createOutboxRoute.md)         | Function  | See API reference. |
| [`inboxProcessedPath`](../api-md/functions/inboxProcessedPath.md)       | Function  | See API reference. |
| [`inboxFailedPath`](../api-md/functions/inboxFailedPath.md)             | Function  | See API reference. |
| [`evaluateRetention`](../api-md/functions/evaluateRetention.md)         | Function  | See API reference. |
| [`AgeRetentionPolicy`](../api-md/interfaces/AgeRetentionPolicy.md)      | Interface | See API reference. |
| [`CountRetentionPolicy`](../api-md/interfaces/CountRetentionPolicy.md)  | Interface | See API reference. |
| [`InMemoryAuditLog`](../api-md/classes/InMemoryAuditLog.md)             | Class     | See API reference. |
| [`createJsonlAuditLog`](../api-md/functions/createJsonlAuditLog.md)     | Function  | See API reference. |
| [`composeAuditLogs`](../api-md/functions/composeAuditLogs.md)           | Function  | See API reference. |
| [`freezeReceipt`](../api-md/functions/freezeReceipt.md)                 | Function  | See API reference. |
| [`summarizeError`](../api-md/functions/summarizeError.md)               | Function  | See API reference. |
| [`MftAuditLog`](../api-md/interfaces/MftAuditLog.md)                    | Interface | See API reference. |
| [`MftAuditEntry`](../api-md/interfaces/MftAuditEntry.md)                | Interface | See API reference. |
| [`dispatchWebhook`](../api-md/functions/dispatchWebhook.md)             | Function  | See API reference. |
| [`signWebhookPayload`](../api-md/functions/signWebhookPayload.md)       | Function  | See API reference. |
| [`createWebhookAuditLog`](../api-md/functions/createWebhookAuditLog.md) | Function  | See API reference. |
| [`WebhookTarget`](../api-md/interfaces/WebhookTarget.md)                | Interface | See API reference. |
| [`WebhookRetryPolicy`](../api-md/interfaces/WebhookRetryPolicy.md)      | Interface | See API reference. |
| [`ApprovalRegistry`](../api-md/classes/ApprovalRegistry.md)             | Class     | See API reference. |
| [`createApprovalGate`](../api-md/functions/createApprovalGate.md)       | Function  | See API reference. |
| [`ApprovalRejectedError`](../api-md/classes/ApprovalRejectedError.md)   | Class     | See API reference. |

## Examples

| Example                                                                                    | What it shows                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`examples/mft-route.ts`](../../examples/mft-route.ts)                                     | Declarative MFT route + cron schedule.                  |
| [`examples/approval-gated-route.ts`](../../examples/approval-gated-route.ts)               | Approval gate for sensitive scheduled routes.           |
| [`examples/atomic-deploy-with-rollback.ts`](../../examples/atomic-deploy-with-rollback.ts) | Atomic blue/green-style deploy with rollback over SFTP. |

## See also

- [Top-level README](../../README.md)
- [Full API reference](../api-md/README.md)
- [Capability matrix](../../README.md#capability-matrix)
- [`packages/mft`](../../packages/mft)
