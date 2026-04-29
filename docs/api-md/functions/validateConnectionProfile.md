[**ZeroTransfer SDK v0.1.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / validateConnectionProfile

# Function: validateConnectionProfile()

```ts
function validateConnectionProfile(profile): ConnectionProfile;
```

Defined in: [src/profiles/ProfileValidator.ts:25](https://github.com/tonywied17/zero-transfer/blob/7827dc828825b195183dc542bf70a9bd2962626e/src/profiles/ProfileValidator.ts#L25)

Validates provider-neutral connection profile fields before provider lookup.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `profile` | [`ConnectionProfile`](../interfaces/ConnectionProfile.md) | Profile to validate. |

## Returns

[`ConnectionProfile`](../interfaces/ConnectionProfile.md)

The original profile when valid.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When required provider, host, or numeric fields are invalid.
