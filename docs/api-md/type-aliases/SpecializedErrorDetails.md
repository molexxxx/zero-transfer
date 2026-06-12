[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SpecializedErrorDetails

# Type Alias: SpecializedErrorDetails

```ts
type SpecializedErrorDetails = Omit<ZeroTransferErrorDetails, "code"> & {
  code?: string;
};
```

Defined in: [src/errors/ZeroTransferError.ts:44](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L44)

Error construction input for subclasses that provide default codes.

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `code?` | `string` | Optional override for the subclass default code. | [src/errors/ZeroTransferError.ts:46](https://github.com/tonywied17/zero-transfer/blob/4642fef99167d4e8cbae741b0ecfe095645afa85/src/errors/ZeroTransferError.ts#L46) |
