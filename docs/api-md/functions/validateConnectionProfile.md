[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / validateConnectionProfile

# Function: validateConnectionProfile()

```ts
function validateConnectionProfile(profile): ConnectionProfile;
```

Defined in: [src/profiles/ProfileValidator.ts:25](https://github.com/tonywied17/zero-transfer/blob/4384f4bbe382c0bc97d7fe822fc67543a79294ce/src/profiles/ProfileValidator.ts#L25)

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
