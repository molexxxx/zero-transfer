[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveCredential

# Interface: SshKeyboardInteractiveCredential

Defined in: [src/protocols/ssh/auth/SshAuthSession.ts:58](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/auth/SshAuthSession.ts#L58)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="respond"></a> `respond` | (`name`, `instruction`, `prompts`) => `string`[] \| `Promise`\<`string`[]\> | Called for each INFO_REQUEST round. Return one string per prompt in order. | [src/protocols/ssh/auth/SshAuthSession.ts:64](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/auth/SshAuthSession.ts#L64) |
| <a id="type"></a> `type` | `"keyboard-interactive"` | - | [src/protocols/ssh/auth/SshAuthSession.ts:59](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/auth/SshAuthSession.ts#L59) |
| <a id="username"></a> `username` | `string` | - | [src/protocols/ssh/auth/SshAuthSession.ts:60](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/protocols/ssh/auth/SshAuthSession.ts#L60) |
