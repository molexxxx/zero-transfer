[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactConnectionProfile

# Function: redactConnectionProfile()

```ts
function redactConnectionProfile(profile): Record<string, unknown>;
```

Defined in: [src/profiles/ProfileRedactor.ts:16](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/profiles/ProfileRedactor.ts#L16)

Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Connection profile to sanitize. |

## Returns

`Record`\<`string`, `unknown`\>

Plain object safe to include in logs, traces, or validation reports.
