[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / errorFromFtpReply

# Function: errorFromFtpReply()

```ts
function errorFromFtpReply(input): ZeroTransferError;
```

Defined in: [src/errors/errorFactory.ts:46](https://github.com/tonywied17/zero-transfer/blob/3b0c75fda9454105c57a1d57b3ceb8b8ca9ec4cf/src/errors/errorFactory.ts#L46)

Maps an FTP reply into the closest typed ZeroTransfer error.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`FtpReplyErrorInput`](../interfaces/FtpReplyErrorInput.md) | FTP code, message, and optional operation context. |

## Returns

[`ZeroTransferError`](../classes/ZeroTransferError.md)

A structured error subclass with stable code and retryability metadata.
