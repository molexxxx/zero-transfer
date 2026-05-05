[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveHandler

# Type Alias: SshKeyboardInteractiveHandler

```ts
type SshKeyboardInteractiveHandler = (challenge) => readonly string[] | Promise<readonly string[]>;
```

Defined in: [src/types/public.ts:154](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/types/public.ts#L154)

Provides ordered answers for an SSH keyboard-interactive authentication challenge.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `challenge` | [`SshKeyboardInteractiveChallenge`](../interfaces/SshKeyboardInteractiveChallenge.md) |

## Returns

readonly `string`[] \| `Promise`\<readonly `string`[]\>
