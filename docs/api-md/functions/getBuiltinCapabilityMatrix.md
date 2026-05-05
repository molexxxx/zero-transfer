[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / getBuiltinCapabilityMatrix

# Function: getBuiltinCapabilityMatrix()

```ts
function getBuiltinCapabilityMatrix(): BuiltinCapabilityMatrixEntry[];
```

Defined in: [src/providers/capabilityMatrix.ts:55](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/capabilityMatrix.ts#L55)

Returns the capability matrix for every shipped provider factory.

Each call constructs a fresh factory snapshot, so the result reflects the
current build (including any future new metadata or notes). Web providers
are constructed with a no-op fetch since capability advertisement does not
require a live transport.

## Returns

[`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[]
