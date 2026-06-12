[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / buildRemoteBreadcrumbs

# Function: buildRemoteBreadcrumbs()

```ts
function buildRemoteBreadcrumbs(input): RemoteBreadcrumb[];
```

Defined in: [src/sync/createRemoteBrowser.ts:100](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/sync/createRemoteBrowser.ts#L100)

Builds breadcrumbs from `/` down to the supplied path.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Absolute remote path. |

## Returns

[`RemoteBreadcrumb`](../interfaces/RemoteBreadcrumb.md)[]

Ordered crumbs starting with the root.
