[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSecretSource

# Interface: FileSecretSource

Defined in: [src/profiles/SecretSource.ts:36](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/profiles/SecretSource.ts#L36)

File-backed secret descriptor.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="encoding"></a> `encoding?` | `BufferEncoding` \| `"buffer"` | Text encoding to use, or `buffer` to return raw bytes. Defaults to `utf8`. | [src/profiles/SecretSource.ts:40](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/profiles/SecretSource.ts#L40) |
| <a id="path"></a> `path` | `string` | Path to the file containing the secret. | [src/profiles/SecretSource.ts:38](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/profiles/SecretSource.ts#L38) |
