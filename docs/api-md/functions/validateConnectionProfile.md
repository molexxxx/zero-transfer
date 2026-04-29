[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / validateConnectionProfile

# Function: validateConnectionProfile()

```ts
function validateConnectionProfile(profile): ConnectionProfile;
```

Defined in: [src/profiles/ProfileValidator.ts:25](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/ProfileValidator.ts#L25)

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
