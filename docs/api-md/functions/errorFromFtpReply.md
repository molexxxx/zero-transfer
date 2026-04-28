[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / errorFromFtpReply

# Function: errorFromFtpReply()

```ts
function errorFromFtpReply(input): ZeroTransferError;
```

Defined in: [src/errors/errorFactory.ts:46](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/errors/errorFactory.ts#L46)

Maps an FTP reply into the closest typed ZeroTransfer error.

## Parameters

| Parameter | Type                                                        | Description                                        |
| --------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `input`   | [`FtpReplyErrorInput`](../interfaces/FtpReplyErrorInput.md) | FTP code, message, and optional operation context. |

## Returns

[`ZeroTransferError`](../classes/ZeroTransferError.md)

A structured error subclass with stable code and retryability metadata.
