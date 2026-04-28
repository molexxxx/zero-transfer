# @zero-transfer/mft

> Routes, schedules, audit logs, webhooks, approval gates.

Managed File Transfer workflow primitives: routes, schedules (interval + cron), inbox/outbox conventions, retention policies, audit logs (in-memory, JSONL, fan-out, webhook-backed), HMAC-signed webhook delivery, and approval gates that require human sign-off before a scheduled run executes.

> **Alpha umbrella package.** Currently re-exports the full `@zero-transfer/sdk` surface so the name is claimable on npm. Future releases will narrow this package to its own subset.

## Install

```bash
npm install @zero-transfer/mft
```

## Usage

```ts
import { createTransferClient } from "@zero-transfer/mft";

const client = createTransferClient();
```

## Documentation

- [Scope page](https://github.com/tonywied17/zero-transfer/blob/main/docs/scopes/mft.md)
- [Full API reference](https://github.com/tonywied17/zero-transfer/blob/main/docs/api-md/README.md)
- [Examples](https://github.com/tonywied17/zero-transfer/tree/main/examples)

## License

MIT © Tony Wiedman
