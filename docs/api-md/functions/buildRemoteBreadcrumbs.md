[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / buildRemoteBreadcrumbs

# Function: buildRemoteBreadcrumbs()

```ts
function buildRemoteBreadcrumbs(input): RemoteBreadcrumb[];
```

Defined in: [src/sync/createRemoteBrowser.ts:100](https://github.com/tonywied17/zero-transfer/blob/6b0c0b0820cf5eac6e4cf75fd3bc783ddbf448fa/src/sync/createRemoteBrowser.ts#L100)

Builds breadcrumbs from `/` down to the supplied path.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Absolute remote path. |

## Returns

[`RemoteBreadcrumb`](../interfaces/RemoteBreadcrumb.md)[]

Ordered crumbs starting with the root.
