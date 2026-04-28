# @zero-transfer/mft

> Routes, schedules, audit logs, webhooks, approval gates.

Managed File Transfer workflow primitives: routes, schedules (interval + cron), inbox/outbox conventions, retention policies, audit logs (in-memory, JSONL, fan-out, webhook-backed), HMAC-signed webhook delivery, and approval gates that require human sign-off before a scheduled run executes.

## Install

```bash
npm install @zero-transfer/mft
```

## Usage

```ts
import { MftRoute, RouteRegistry, runRoute } from "@zero-transfer/mft";
```

## Public surface

This package narrows the SDK to **30** exports. See the [scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/mft.md#public-surface) for the full list with API-reference links.

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/mft.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
