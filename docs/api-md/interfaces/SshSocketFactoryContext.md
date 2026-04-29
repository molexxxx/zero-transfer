[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshSocketFactoryContext

# Interface: SshSocketFactoryContext

Defined in: [src/types/public.ts:93](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L93)

Context passed to SSH socket factories before opening an SSH session.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="host"></a> `host` | `string` | Target SSH host from the resolved connection profile. | [src/types/public.ts:95](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L95) |
| <a id="port"></a> `port` | `number` | Target SSH port from the resolved connection profile. | [src/types/public.ts:97](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L97) |
| <a id="signal"></a> `signal?` | `AbortSignal` | Abort signal from the connection profile, when one is configured. | [src/types/public.ts:101](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L101) |
| <a id="username"></a> `username?` | `string` | Resolved username, when configured on the connection profile. | [src/types/public.ts:99](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/types/public.ts#L99) |
