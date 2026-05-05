[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactoryContext

# Interface: SshSocketFactoryContext

Defined in: [src/types/public.ts:112](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L112)

Context passed to SSH socket factories before opening an SSH session.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="host"></a> `host` | `string` | Target SSH host from the resolved connection profile. | [src/types/public.ts:114](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L114) |
| <a id="port"></a> `port` | `number` | Target SSH port from the resolved connection profile. | [src/types/public.ts:116](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L116) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal from the connection profile, when one is configured. | [src/types/public.ts:120](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L120) |
| <a id="username"></a> `username?` | `string` | Resolved username, when configured on the connection profile. | [src/types/public.ts:118](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/types/public.ts#L118) |
