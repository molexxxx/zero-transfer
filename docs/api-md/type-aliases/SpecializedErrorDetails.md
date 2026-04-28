[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SpecializedErrorDetails

# Type Alias: SpecializedErrorDetails

```ts
type SpecializedErrorDetails = Omit<ZeroTransferErrorDetails, "code"> & {
  code?: string;
};
```

Defined in: [src/errors/ZeroTransferError.ts:43](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/errors/ZeroTransferError.ts#L43)

Error construction input for subclasses that provide default codes.

## Type Declaration

| Name    | Type     | Description                                      | Defined in                                                                                                                                                          |
| ------- | -------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code?` | `string` | Optional override for the subclass default code. | [src/errors/ZeroTransferError.ts:45](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/errors/ZeroTransferError.ts#L45) |
