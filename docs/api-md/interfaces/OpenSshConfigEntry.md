[**ZeroTransfer SDK v0.4.3**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OpenSshConfigEntry

# Interface: OpenSshConfigEntry

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:14](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/profiles/importers/OpenSshConfigImporter.ts#L14)

Parsed `Host` block from an OpenSSH config file.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="options"></a> `options` | `Readonly`\<`Record`\<`string`, readonly `string`[]\>\> | Lower-cased directive name to ordered values. Multi-valued directives (e.g. `IdentityFile`) preserve order. | [src/profiles/importers/OpenSshConfigImporter.ts:18](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/profiles/importers/OpenSshConfigImporter.ts#L18) |
| <a id="patterns"></a> `patterns` | readonly `string`[] | Host patterns declared on the `Host` line. | [src/profiles/importers/OpenSshConfigImporter.ts:16](https://github.com/tonywied17/zero-transfer/blob/fce0f6887e2aa69b47367b655ef1898ffa904508/src/profiles/importers/OpenSshConfigImporter.ts#L16) |
