[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createLocalProviderFactory

# Function: createLocalProviderFactory()

```ts
function createLocalProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/local/LocalProvider.ts:88](https://github.com/tonywied17/zero-transfer/blob/1409be96b9cb3f76d6e94d27d5e243ebcbb41223/src/providers/local/LocalProvider.ts#L88)

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
