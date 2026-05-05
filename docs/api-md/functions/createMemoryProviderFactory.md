[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createMemoryProviderFactory

# Function: createMemoryProviderFactory()

```ts
function createMemoryProviderFactory(options?): ProviderFactory;
```

Defined in: [src/providers/memory/MemoryProvider.ts:104](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/providers/memory/MemoryProvider.ts#L104)

Creates a provider factory backed by deterministic in-memory fixture entries.

Useful for tests and examples where you want a real `TransferSession` without
touching disk or the network. Entries are pre-seeded; mutations made through
the session are visible to subsequent operations on the same provider.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`MemoryProviderOptions`](../interfaces/MemoryProviderOptions.md) | Optional fixture entries to expose through the memory provider. |

## Returns

[`ProviderFactory`](../interfaces/ProviderFactory.md)

Provider factory suitable for `createTransferClient({ providers: [...] })`.

## Example

```ts
import { createMemoryProviderFactory, createTransferClient } from "@zero-transfer/sdk";

const client = createTransferClient({
  providers: [createMemoryProviderFactory({
    entries: [
      { path: "/fixtures/hello.txt", content: "hello world" },
      { path: "/fixtures/data.bin", content: new Uint8Array([1, 2, 3]) },
    ],
  })],
});

const session = await client.connect({ host: "fixtures", provider: "memory" });
console.log(await session.fs.list("/fixtures"));
```
