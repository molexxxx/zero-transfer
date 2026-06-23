[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createLocalProviderFactory

# Function: createLocalProviderFactory()

```ts
function createLocalProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/local/LocalProvider.ts:91](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/local/LocalProvider.ts#L91)

Creates a provider factory backed by the local filesystem.

Useful for copying files between two remote endpoints via a local staging
area, or as the destination for `downloadFile`. The friendly `uploadFile`
helper registers a local provider implicitly.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`LocalProviderOptions`](../interfaces/LocalProviderOptions.md) | Optional local root path exposed through provider sessions. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createLocalProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createLocalProviderFactory({ rootPath: "/var/lib/zt-staging" })],
});

const session = await client.connect({ host: "staging", provider: "local" });
const list = await session.fs.list("/");
```
