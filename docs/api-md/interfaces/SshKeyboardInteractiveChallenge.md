[**ZeroTransfer SDK v0.3.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshKeyboardInteractiveChallenge

# Interface: SshKeyboardInteractiveChallenge

Defined in: [src/types/public.ts:142](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/types/public.ts#L142)

Input passed to SSH keyboard-interactive answer providers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="instructions"></a> `instructions` | `string` | Server-provided instructions for the prompt set. | [src/types/public.ts:146](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/types/public.ts#L146) |
| <a id="language"></a> `language` | `string` | Server-provided language tag, when supplied. | [src/types/public.ts:148](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/types/public.ts#L148) |
| <a id="name"></a> `name` | `string` | Server-provided challenge title. | [src/types/public.ts:144](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/types/public.ts#L144) |
| <a id="prompts"></a> `prompts` | readonly [`SshKeyboardInteractivePrompt`](SshKeyboardInteractivePrompt.md)[] | Ordered prompts that require answers. | [src/types/public.ts:150](https://github.com/tonywied17/zero-transfer/blob/c68c4294e4eb621edd6d8f74af060620c8edd302/src/types/public.ts#L150) |
