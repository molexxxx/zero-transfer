[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / fingerprintsMatch

# Function: fingerprintsMatch()

```ts
function fingerprintsMatch(stored, current): boolean;
```

Defined in: [src/transfers/TransferCheckpointStore.ts:190](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/transfers/TransferCheckpointStore.ts#L190)

Compares a stored fingerprint against the current source fingerprint.

A checkpoint is only trustworthy when at least one field is comparable on
both sides and every comparable field matches exactly. A source with no
comparable metadata never matches - resuming without any change detection
risks corrupting the destination.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stored` | [`TransferSourceFingerprint`](../interfaces/TransferSourceFingerprint.md) | Fingerprint captured when the checkpoint was written. |
| `current` | [`TransferSourceFingerprint`](../interfaces/TransferSourceFingerprint.md) | Fingerprint of the source object right now. |

## Returns

`boolean`

`true` when the source is provably unchanged.
