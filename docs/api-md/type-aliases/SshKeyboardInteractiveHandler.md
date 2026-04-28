[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveHandler

# Type Alias: SshKeyboardInteractiveHandler

```ts
type SshKeyboardInteractiveHandler = (challenge) => readonly string[] | Promise<readonly string[]>;
```

Defined in: [src/types/public.ts:135](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/types/public.ts#L135)

Provides ordered answers for an SSH keyboard-interactive authentication challenge.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `challenge` | [`SshKeyboardInteractiveChallenge`](../interfaces/SshKeyboardInteractiveChallenge.md) |

## Returns

readonly `string`[] \| `Promise`\<readonly `string`[]\>
