[**ZeroTransfer SDK v0.1.0**](../README.md)

---

[ZeroTransfer SDK](../README.md) / getBuiltinCapabilityMatrix

# Function: getBuiltinCapabilityMatrix()

```ts
function getBuiltinCapabilityMatrix(): BuiltinCapabilityMatrixEntry[];
```

Defined in: [src/providers/capabilityMatrix.ts:54](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/capabilityMatrix.ts#L54)

Returns the capability matrix for every shipped provider factory.

Each call constructs a fresh factory snapshot, so the result reflects the
current build (including any future new metadata or notes). Web providers
are constructed with a no-op fetch since capability advertisement does not
require a live transport.

## Returns

[`BuiltinCapabilityMatrixEntry`](../interfaces/BuiltinCapabilityMatrixEntry.md)[]
