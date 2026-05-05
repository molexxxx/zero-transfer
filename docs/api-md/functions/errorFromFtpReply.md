[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / errorFromFtpReply

# Function: errorFromFtpReply()

```ts
function errorFromFtpReply(input): ZeroTransferError;
```

Defined in: [src/errors/errorFactory.ts:46](https://github.com/tonywied17/zero-transfer/blob/7122761ae2c4dd865e3f364ad3d5692c88bbfbb7/src/errors/errorFactory.ts#L46)

Maps an FTP reply into the closest typed ZeroTransfer error.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`FtpReplyErrorInput`](../interfaces/FtpReplyErrorInput.md) | FTP code, message, and optional operation context. |

## Returns

[`ZeroTransferError`](../classes/ZeroTransferError.md)

A structured error subclass with stable code and retryability metadata.
