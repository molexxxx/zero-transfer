[**ZeroTransfer SDK v0.1.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ApprovalRegistry

# Class: ApprovalRegistry

Defined in: [src/mft/approvals.ts:64](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L64)

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

Defined in: [src/mft/approvals.ts:118](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L118)

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

Defined in: [src/mft/approvals.ts:76](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L76)

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
| `request` | [`ApprovalRequest`](../interfaces/ApprovalRequest.md) | [src/mft/approvals.ts:79](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L79) |
| `settled` | `Promise`\<[`ApprovalRequest`](../interfaces/ApprovalRequest.md)\> | [src/mft/approvals.ts:79](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L79) |

***

### get()

```ts
get(id): ApprovalRequest | undefined;
```

Defined in: [src/mft/approvals.ts:149](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L149)

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

Defined in: [src/mft/approvals.ts:159](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L159)

Lists every request ever created.

#### Returns

[`ApprovalRequest`](../interfaces/ApprovalRequest.md)[]

***

### listPending()

```ts
listPending(): ApprovalRequest[];
```

Defined in: [src/mft/approvals.ts:154](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L154)

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

Defined in: [src/mft/approvals.ts:134](https://github.com/tonywied17/zero-transfer/blob/4e582b06411b7a18b031b72a380f03df90446b82/src/mft/approvals.ts#L134)

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
