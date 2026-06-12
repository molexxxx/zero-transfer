[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveCredential

# Interface: SshKeyboardInteractiveCredential

Defined in: [src/protocols/ssh/auth/SshAuthSession.ts:58](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/protocols/ssh/auth/SshAuthSession.ts#L58)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="respond"></a> `respond` | (`name`, `instruction`, `prompts`) => `string`[] \| `Promise`\<`string`[]\> | Called for each INFO_REQUEST round. Return one string per prompt in order. | [src/protocols/ssh/auth/SshAuthSession.ts:64](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/protocols/ssh/auth/SshAuthSession.ts#L64) |
| <a id="type"></a> `type` | `"keyboard-interactive"` | - | [src/protocols/ssh/auth/SshAuthSession.ts:59](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/protocols/ssh/auth/SshAuthSession.ts#L59) |
| <a id="username"></a> `username` | `string` | - | [src/protocols/ssh/auth/SshAuthSession.ts:60](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/protocols/ssh/auth/SshAuthSession.ts#L60) |
