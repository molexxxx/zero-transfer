[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / redactConnectionProfile

# Function: redactConnectionProfile()

```ts
function redactConnectionProfile(profile): Record<string, unknown>;
```

Defined in: [src/profiles/ProfileRedactor.ts:16](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/profiles/ProfileRedactor.ts#L16)

Produces a diagnostics-safe profile copy with credentials and runtime hooks redacted.

## Parameters

| Parameter | Type                                                      | Description                     |
| --------- | --------------------------------------------------------- | ------------------------------- |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Connection profile to sanitize. |

## Returns

`Record`\<`string`, `unknown`\>

Plain object safe to include in logs, traces, or validation reports.
