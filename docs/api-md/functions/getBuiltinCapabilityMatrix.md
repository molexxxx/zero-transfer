[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / getBuiltinCapabilityMatrix

# Function: getBuiltinCapabilityMatrix()

```ts
function getBuiltinCapabilityMatrix(): BuiltinCapabilityMatrixEntry[];
```

Defined in: [src/providers/capabilityMatrix.ts:55](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/providers/capabilityMatrix.ts#L55)

Returns the capability matrix for every shipped provider factory.

Each call constructs a fresh factory snapshot, so the result reflects the
current build (including any future new metadata or notes). Web providers
are constructed with a no-op fetch since capability advertisement does not
require a live transport.

## Returns

[`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[]
