[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / buildRemoteBreadcrumbs

# Function: buildRemoteBreadcrumbs()

```ts
function buildRemoteBreadcrumbs(input): RemoteBreadcrumb[];
```

Defined in: [src/sync/createRemoteBrowser.ts:100](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/sync/createRemoteBrowser.ts#L100)

Builds breadcrumbs from `/` down to the supplied path.

## Parameters

| Parameter | Type     | Description           |
| --------- | -------- | --------------------- |
| `input`   | `string` | Absolute remote path. |

## Returns

[`RemoteBreadcrumb`](../interfaces/RemoteBreadcrumb.md)[]

Ordered crumbs starting with the root.
