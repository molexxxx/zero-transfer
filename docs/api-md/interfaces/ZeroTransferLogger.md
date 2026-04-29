[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ZeroTransferLogger

# Interface: ZeroTransferLogger

Defined in: [src/logging/Logger.ts:61](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/logging/Logger.ts#L61)

Partial structured logger accepted by ZeroTransfer.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="debug"></a> `debug?` | [`LoggerMethod`](../type-aliases/LoggerMethod.md) | Receives development/debugging records. | [src/logging/Logger.ts:65](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/logging/Logger.ts#L65) |
| <a id="error"></a> `error?` | [`LoggerMethod`](../type-aliases/LoggerMethod.md) | Receives failed operation records. | [src/logging/Logger.ts:71](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/logging/Logger.ts#L71) |
| <a id="info"></a> `info?` | [`LoggerMethod`](../type-aliases/LoggerMethod.md) | Receives normal lifecycle records. | [src/logging/Logger.ts:67](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/logging/Logger.ts#L67) |
| <a id="trace"></a> `trace?` | [`LoggerMethod`](../type-aliases/LoggerMethod.md) | Receives highly detailed diagnostic records. | [src/logging/Logger.ts:63](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/logging/Logger.ts#L63) |
| <a id="warn"></a> `warn?` | [`LoggerMethod`](../type-aliases/LoggerMethod.md) | Receives recoverable issue records. | [src/logging/Logger.ts:69](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/logging/Logger.ts#L69) |
