[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileZillaSite

# Interface: FileZillaSite

Defined in: [src/profiles/importers/FileZillaImporter.ts:16](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/FileZillaImporter.ts#L16)

Imported FileZilla site with the folder hierarchy that contained it.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="folder"></a> `folder` | readonly `string`[] | Ordered folder names leading to the site (top-level first). Empty for root sites. | [src/profiles/importers/FileZillaImporter.ts:20](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/FileZillaImporter.ts#L20) |
| <a id="hasstoredpassword"></a> `hasStoredPassword` | `boolean` | Whether the FileZilla entry stored a password. The importer never decodes or returns stored passwords; supply the credential via a [SecretSource](ConnectionProfile.md#password) (for example `{ env: "SITE_PASSWORD" }` or `{ path: "./secret" }`) before connecting. | [src/profiles/importers/FileZillaImporter.ts:29](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/FileZillaImporter.ts#L29) |
| <a id="logontype"></a> `logonType?` | `number` | Logon type code preserved from the file (`0`=anonymous, `1`=normal, etc.). | [src/profiles/importers/FileZillaImporter.ts:31](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/FileZillaImporter.ts#L31) |
| <a id="name"></a> `name` | `string` | Site display name. | [src/profiles/importers/FileZillaImporter.ts:18](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/FileZillaImporter.ts#L18) |
| <a id="profile"></a> `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Generated connection profile. | [src/profiles/importers/FileZillaImporter.ts:22](https://github.com/tonywied17/zero-transfer/blob/7b724e9821289c9e53b5eb587169b59a7d1172f6/src/profiles/importers/FileZillaImporter.ts#L22) |
