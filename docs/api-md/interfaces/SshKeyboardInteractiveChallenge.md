[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveChallenge

# Interface: SshKeyboardInteractiveChallenge

Defined in: [src/types/public.ts:123](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L123)

Input passed to SSH keyboard-interactive answer providers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="instructions"></a> `instructions` | `string` | Server-provided instructions for the prompt set. | [src/types/public.ts:127](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L127) |
| <a id="language"></a> `language` | `string` | Server-provided language tag, when supplied. | [src/types/public.ts:129](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L129) |
| <a id="name"></a> `name` | `string` | Server-provided challenge title. | [src/types/public.ts:125](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L125) |
| <a id="prompts"></a> `prompts` | readonly [`SshKeyboardInteractivePrompt`](SshKeyboardInteractivePrompt.md)[] | Ordered prompts that require answers. | [src/types/public.ts:131](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/types/public.ts#L131) |
