[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferEngine

# Class: TransferEngine

Defined in: [src/transfers/TransferEngine.ts:87](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L87)

Executes transfer jobs and produces audit-friendly receipts.

## Constructors

### Constructor

```ts
new TransferEngine(options?): TransferEngine;
```

Defined in: [src/transfers/TransferEngine.ts:95](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L95)

Creates a transfer engine.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TransferEngineOptions`](../interfaces/TransferEngineOptions.md) | Optional clock override for deterministic tests. |

#### Returns

`TransferEngine`

## Methods

### execute()

```ts
execute(
   job, 
   executor, 
options?): Promise<TransferReceipt>;
```

Defined in: [src/transfers/TransferEngine.ts:109](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/transfers/TransferEngine.ts#L109)

Executes a transfer job through a caller-supplied operation.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `job` | [`TransferJob`](../interfaces/TransferJob.md) | Job metadata used for correlation and receipts. |
| `executor` | [`TransferExecutor`](../type-aliases/TransferExecutor.md) | Concrete transfer operation implementation. |
| `options` | [`TransferEngineExecuteOptions`](../interfaces/TransferEngineExecuteOptions.md) | Optional abort, retry, and progress hooks. |

#### Returns

`Promise`\<[`TransferReceipt`](../interfaces/TransferReceipt.md)\>

Receipt for the completed transfer.

#### Throws

[AbortError](AbortError.md) When execution is cancelled.

#### Throws

[TransferError](TransferError.md) When all attempts fail.
