[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactoryContext

# Interface: SshSocketFactoryContext

Defined in: [src/types/public.ts:112](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L112)

Context passed to SSH socket factories before opening an SSH session.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="host"></a> `host` | `string` | Target SSH host from the resolved connection profile. | [src/types/public.ts:114](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L114) |
| <a id="port"></a> `port` | `number` | Target SSH port from the resolved connection profile. | [src/types/public.ts:116](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L116) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal from the connection profile, when one is configured. | [src/types/public.ts:120](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L120) |
| <a id="username"></a> `username?` | `string` | Resolved username, when configured on the connection profile. | [src/types/public.ts:118](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/types/public.ts#L118) |
