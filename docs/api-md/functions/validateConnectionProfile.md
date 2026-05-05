[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / validateConnectionProfile

# Function: validateConnectionProfile()

```ts
function validateConnectionProfile(profile): ConnectionProfile;
```

Defined in: [src/profiles/ProfileValidator.ts:25](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/profiles/ProfileValidator.ts#L25)

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
