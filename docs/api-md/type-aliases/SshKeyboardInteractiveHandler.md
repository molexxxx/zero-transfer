[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveHandler

# Type Alias: SshKeyboardInteractiveHandler

```ts
type SshKeyboardInteractiveHandler = (challenge) => readonly string[] | Promise<readonly string[]>;
```

Defined in: [src/types/public.ts:154](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/types/public.ts#L154)

Provides ordered answers for an SSH keyboard-interactive authentication challenge.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `challenge` | [`SshKeyboardInteractiveChallenge`](../interfaces/SshKeyboardInteractiveChallenge.md) |

## Returns

readonly `string`[] \| `Promise`\<readonly `string`[]\>
