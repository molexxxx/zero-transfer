[**ZeroTransfer SDK v0.1.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSecretSource

# Interface: FileSecretSource

Defined in: [src/profiles/SecretSource.ts:36](https://github.com/tonywied17/zero-transfer/blob/4384f4bbe382c0bc97d7fe822fc67543a79294ce/src/profiles/SecretSource.ts#L36)

File-backed secret descriptor.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="encoding"></a> `encoding?` | `BufferEncoding` \| `"buffer"` | Text encoding to use, or `buffer` to return raw bytes. Defaults to `utf8`. | [src/profiles/SecretSource.ts:40](https://github.com/tonywied17/zero-transfer/blob/4384f4bbe382c0bc97d7fe822fc67543a79294ce/src/profiles/SecretSource.ts#L40) |
| <a id="path"></a> `path` | `string` | Path to the file containing the secret. | [src/profiles/SecretSource.ts:38](https://github.com/tonywied17/zero-transfer/blob/4384f4bbe382c0bc97d7fe822fc67543a79294ce/src/profiles/SecretSource.ts#L38) |
