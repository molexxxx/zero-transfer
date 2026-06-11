[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SpecializedErrorDetails

# Type Alias: SpecializedErrorDetails

```ts
type SpecializedErrorDetails = Omit<ZeroTransferErrorDetails, "code"> & {
  code?: string;
};
```

Defined in: [src/errors/ZeroTransferError.ts:44](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L44)

Error construction input for subclasses that provide default codes.

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `code?` | `string` | Optional override for the subclass default code. | [src/errors/ZeroTransferError.ts:46](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/errors/ZeroTransferError.ts#L46) |
