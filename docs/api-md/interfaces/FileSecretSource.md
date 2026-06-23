[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileSecretSource

# Interface: FileSecretSource

Defined in: [src/profiles/SecretSource.ts:36](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/SecretSource.ts#L36)

File-backed secret descriptor.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="encoding"></a> `encoding?` | `BufferEncoding` \| `"buffer"` | Text encoding to use, or `buffer` to return raw bytes. Defaults to `utf8`. | [src/profiles/SecretSource.ts:40](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/SecretSource.ts#L40) |
| <a id="path"></a> `path` | `string` | Path to the file containing the secret. | [src/profiles/SecretSource.ts:38](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/SecretSource.ts#L38) |
