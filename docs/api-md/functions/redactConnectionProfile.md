[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactConnectionProfile

# Function: redactConnectionProfile()

```ts
function redactConnectionProfile(profile): Record<string, unknown>;
```

Defined in: [src/profiles/ProfileRedactor.ts:16](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/profiles/ProfileRedactor.ts#L16)

Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Connection profile to sanitize. |

## Returns

`Record`\<`string`, `unknown`\>

Plain object safe to include in logs, traces, or validation reports.
