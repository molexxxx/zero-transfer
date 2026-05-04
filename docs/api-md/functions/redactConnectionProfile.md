[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactConnectionProfile

# Function: redactConnectionProfile()

```ts
function redactConnectionProfile(profile): Record<string, unknown>;
```

Defined in: [src/profiles/ProfileRedactor.ts:16](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/profiles/ProfileRedactor.ts#L16)

Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Connection profile to sanitize. |

## Returns

`Record`\<`string`, `unknown`\>

Plain object safe to include in logs, traces, or validation reports.
