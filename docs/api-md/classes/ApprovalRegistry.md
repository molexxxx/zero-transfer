[**ZeroTransfer SDK v0.4.7**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ApprovalRegistry

# Class: ApprovalRegistry

Defined in: [src/mft/approvals.ts:87](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L87)

In-memory approval registry.

## Constructors

### Constructor

```ts
new ApprovalRegistry(): ApprovalRegistry;
```

#### Returns

`ApprovalRegistry`

## Methods

### approve()

```ts
approve(
   id, 
   input?, 
   now?): ApprovalRequest;
```

Defined in: [src/mft/approvals.ts:141](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L141)

Approves a pending request.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Approval id to resolve. |
| `input` | \{ `reason?`: `string`; `resolvedBy?`: `string`; \} | Optional reviewer identifier and reason. |
| `input.reason?` | `string` | - |
| `input.resolvedBy?` | `string` | - |
| `now` | `Date` | Reference clock used to stamp `resolvedAt`. |

#### Returns

[`ApprovalRequest`](../interfaces/ApprovalRequest.md)

The updated approval record.

***

### create()

```ts
create(input, now?): {
  request: ApprovalRequest;
  settled: Promise<ApprovalRequest>;
};
```

Defined in: [src/mft/approvals.ts:99](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L99)

Creates a new request and returns a promise that resolves when the request
transitions out of `"pending"` state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `id`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `routeId`: `string`; \} | Request seed (id, routeId, optional metadata). |
| `input.id` | `string` | - |
| `input.metadata?` | `Record`\<`string`, `unknown`\> | - |
| `input.routeId` | `string` | - |
| `now` | `Date` | Reference clock used to stamp `requestedAt`. |

#### Returns

```ts
{
  request: ApprovalRequest;
  settled: Promise<ApprovalRequest>;
}
```

The created request and a promise tracking its resolution.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `request` | [`ApprovalRequest`](../interfaces/ApprovalRequest.md) | [src/mft/approvals.ts:102](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L102) |
| `settled` | `Promise`\<[`ApprovalRequest`](../interfaces/ApprovalRequest.md)\> | [src/mft/approvals.ts:102](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L102) |

***

### get()

```ts
get(id): ApprovalRequest | undefined;
```

Defined in: [src/mft/approvals.ts:172](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L172)

Looks up a request by id.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

[`ApprovalRequest`](../interfaces/ApprovalRequest.md) \| `undefined`

***

### list()

```ts
list(): ApprovalRequest[];
```

Defined in: [src/mft/approvals.ts:182](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L182)

Lists every request ever created.

#### Returns

[`ApprovalRequest`](../interfaces/ApprovalRequest.md)[]

***

### listPending()

```ts
listPending(): ApprovalRequest[];
```

Defined in: [src/mft/approvals.ts:177](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L177)

Lists pending requests in insertion order.

#### Returns

[`ApprovalRequest`](../interfaces/ApprovalRequest.md)[]

***

### reject()

```ts
reject(
   id, 
   input?, 
   now?): ApprovalRequest;
```

Defined in: [src/mft/approvals.ts:157](https://github.com/tonywied17/zero-transfer/blob/598971d8cd1d7c377543b1eea812b5faaecb8591/src/mft/approvals.ts#L157)

Rejects a pending request.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Approval id to resolve. |
| `input` | \{ `reason?`: `string`; `resolvedBy?`: `string`; \} | Optional reviewer identifier and reason. |
| `input.reason?` | `string` | - |
| `input.resolvedBy?` | `string` | - |
| `now` | `Date` | Reference clock used to stamp `resolvedAt`. |

#### Returns

[`ApprovalRequest`](../interfaces/ApprovalRequest.md)

The updated approval record.
