[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveHandler

# Type Alias: SshKeyboardInteractiveHandler

```ts
type SshKeyboardInteractiveHandler = (challenge) => readonly string[] | Promise<readonly string[]>;
```

Defined in: [src/types/public.ts:154](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/types/public.ts#L154)

Provides ordered answers for an SSH keyboard-interactive authentication challenge.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `challenge` | [`SshKeyboardInteractiveChallenge`](../interfaces/SshKeyboardInteractiveChallenge.md) |

## Returns

readonly `string`[] \| `Promise`\<readonly `string`[]\>
