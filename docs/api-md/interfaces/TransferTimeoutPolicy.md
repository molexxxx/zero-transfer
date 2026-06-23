[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / TransferTimeoutPolicy

# Interface: TransferTimeoutPolicy

Defined in: [src/transfers/TransferJob.ts:74](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L74)

Timeout policy applied by the transfer engine.

Two timeout scopes exist with deliberately different failure semantics:

- **Job scope** ([timeoutMs](#timeoutms)): covers the full engine execution
  including retries. When it fires, the engine rethrows the
  [TimeoutError](../classes/TimeoutError.md) immediately - the retry policy is never consulted.
- **Attempt scope** ([attemptTimeoutMs](#attempttimeoutms) and [stallTimeoutMs](#stalltimeoutms)):
  covers a single attempt. When either fires, the per-attempt abort
  controller cancels the attempt and the resulting [TimeoutError](../classes/TimeoutError.md)
  flows into the retry policy like any other attempt failure, so retryable
  timeouts are retried (with backoff) instead of failing the job.

## Example

```ts
await engine.execute(job, executor, {
  retry: createDefaultRetryPolicy(),
  timeout: { timeoutMs: 600_000, attemptTimeoutMs: 120_000, stallTimeoutMs: 30_000 },
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="attempttimeoutms"></a> `attemptTimeoutMs?` | `number` | Maximum duration for a single attempt in milliseconds. Expiry aborts only the active attempt; the failure flows into the retry policy. | [src/transfers/TransferJob.ts:81](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L81) |
| <a id="retryable"></a> `retryable?` | `boolean` | Whether timeout failures are retryable. Defaults to `true`. | [src/transfers/TransferJob.ts:89](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L89) |
| <a id="stalltimeoutms"></a> `stallTimeoutMs?` | `number` | Maximum time without progress before an attempt is considered stalled, in milliseconds. The watchdog resets on every progress report; expiry aborts only the active attempt and the failure flows into the retry policy. | [src/transfers/TransferJob.ts:87](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L87) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Maximum duration for the full engine execution, including retries, in milliseconds. | [src/transfers/TransferJob.ts:76](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/transfers/TransferJob.ts#L76) |
