[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / getBuiltinCapabilityMatrix

# Function: getBuiltinCapabilityMatrix()

```ts
function getBuiltinCapabilityMatrix(): BuiltinCapabilityMatrixEntry[];
```

Defined in: [src/providers/capabilityMatrix.ts:54](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/capabilityMatrix.ts#L54)

Returns the capability matrix for every shipped provider factory.

Each call constructs a fresh factory snapshot, so the result reflects the
current build (including any future new metadata or notes). Web providers
are constructed with a no-op fetch since capability advertisement does not
require a live transport.

## Returns

[`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[]
