[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / DispatchWebhookResult

# Interface: DispatchWebhookResult

Defined in: [src/mft/webhooks.ts:57](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/webhooks.ts#L57)

Result returned by [dispatchWebhook](../functions/dispatchWebhook.md).

## Properties

| Property                           | Type      | Description                       | Defined in                                                                                                                                  |
| ---------------------------------- | --------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="attempts"></a> `attempts`   | `number`  | Number of attempts performed.     | [src/mft/webhooks.ts:63](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/webhooks.ts#L63) |
| <a id="delivered"></a> `delivered` | `boolean` | Whether the delivery succeeded.   | [src/mft/webhooks.ts:59](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/webhooks.ts#L59) |
| <a id="status"></a> `status`       | `number`  | HTTP status of the final attempt. | [src/mft/webhooks.ts:61](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/mft/webhooks.ts#L61) |
