[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SshKeyboardInteractiveHandler

# Type Alias: SshKeyboardInteractiveHandler

```ts
type SshKeyboardInteractiveHandler = (challenge) => readonly string[] | Promise<readonly string[]>;
```

Defined in: [src/types/public.ts:135](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/types/public.ts#L135)

Provides ordered answers for an SSH keyboard-interactive authentication challenge.

## Parameters

| Parameter   | Type                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| `challenge` | [`SshKeyboardInteractiveChallenge`](../interfaces/SshKeyboardInteractiveChallenge.md) |

## Returns

readonly `string`[] \| `Promise`\<readonly `string`[]\>
