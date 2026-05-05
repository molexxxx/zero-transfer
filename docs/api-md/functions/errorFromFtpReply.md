[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / errorFromFtpReply

# Function: errorFromFtpReply()

```ts
function errorFromFtpReply(input): ZeroTransferError;
```

Defined in: [src/errors/errorFactory.ts:46](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/errors/errorFactory.ts#L46)

Maps an FTP reply into the closest typed ZeroTransfer error.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`FtpReplyErrorInput`](../interfaces/FtpReplyErrorInput.md) | FTP code, message, and optional operation context. |

## Returns

[`ZeroTransferError`](../classes/ZeroTransferError.md)

A structured error subclass with stable code and retryability metadata.
