[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / WinScpSession

# Interface: WinScpSession

Defined in: [src/profiles/importers/WinScpImporter.ts:13](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/WinScpImporter.ts#L13)

Imported WinSCP session entry.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="folder"></a> `folder` | readonly `string`[] | Hierarchical path segments derived from the session name (folders separated by `/`). | [src/profiles/importers/WinScpImporter.ts:17](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/WinScpImporter.ts#L17) |
| <a id="fsprotocol"></a> `fsProtocol?` | `number` | Raw FSProtocol code preserved from the file. | [src/profiles/importers/WinScpImporter.ts:21](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/WinScpImporter.ts#L21) |
| <a id="ftps"></a> `ftps?` | `number` | Raw Ftps code preserved from the file (`0`=none, `1`=implicit, `2`/`3`=explicit). | [src/profiles/importers/WinScpImporter.ts:23](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/WinScpImporter.ts#L23) |
| <a id="name"></a> `name` | `string` | Decoded session name (URL-decoded path under the `Sessions\\` namespace). | [src/profiles/importers/WinScpImporter.ts:15](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/WinScpImporter.ts#L15) |
| <a id="profile"></a> `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Generated connection profile. | [src/profiles/importers/WinScpImporter.ts:19](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/profiles/importers/WinScpImporter.ts#L19) |
