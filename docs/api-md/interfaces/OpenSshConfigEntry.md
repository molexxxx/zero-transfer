[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / OpenSshConfigEntry

# Interface: OpenSshConfigEntry

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:14](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/OpenSshConfigImporter.ts#L14)

Parsed `Host` block from an OpenSSH config file.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="options"></a> `options` | `Readonly`\<`Record`\<`string`, readonly `string`[]\>\> | Lower-cased directive name to ordered values. Multi-valued directives (e.g. `IdentityFile`) preserve order. | [src/profiles/importers/OpenSshConfigImporter.ts:18](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/OpenSshConfigImporter.ts#L18) |
| <a id="patterns"></a> `patterns` | readonly `string`[] | Host patterns declared on the `Host` line. | [src/profiles/importers/OpenSshConfigImporter.ts:16](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/profiles/importers/OpenSshConfigImporter.ts#L16) |
