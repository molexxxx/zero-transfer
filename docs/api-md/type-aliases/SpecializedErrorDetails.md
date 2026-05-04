[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SpecializedErrorDetails

# Type Alias: SpecializedErrorDetails

```ts
type SpecializedErrorDetails = Omit<ZeroTransferErrorDetails, "code"> & {
  code?: string;
};
```

Defined in: [src/errors/ZeroTransferError.ts:43](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/errors/ZeroTransferError.ts#L43)

Error construction input for subclasses that provide default codes.

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `code?` | `string` | Optional override for the subclass default code. | [src/errors/ZeroTransferError.ts:45](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/errors/ZeroTransferError.ts#L45) |
