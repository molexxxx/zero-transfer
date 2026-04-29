[**ZeroTransfer SDK v0.1.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FileZillaSite

# Interface: FileZillaSite

Defined in: [src/profiles/importers/FileZillaImporter.ts:15](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/importers/FileZillaImporter.ts#L15)

Imported FileZilla site with the folder hierarchy that contained it.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="folder"></a> `folder` | readonly `string`[] | Ordered folder names leading to the site (top-level first). Empty for root sites. | [src/profiles/importers/FileZillaImporter.ts:19](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/importers/FileZillaImporter.ts#L19) |
| <a id="logontype"></a> `logonType?` | `number` | Logon type code preserved from the file (`0`=anonymous, `1`=normal, etc.). | [src/profiles/importers/FileZillaImporter.ts:25](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/importers/FileZillaImporter.ts#L25) |
| <a id="name"></a> `name` | `string` | Site display name. | [src/profiles/importers/FileZillaImporter.ts:17](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/importers/FileZillaImporter.ts#L17) |
| <a id="password"></a> `password?` | `string` | Encoded password value retained from the file, if any. | [src/profiles/importers/FileZillaImporter.ts:23](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/importers/FileZillaImporter.ts#L23) |
| <a id="profile"></a> `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Generated connection profile. | [src/profiles/importers/FileZillaImporter.ts:21](https://github.com/tonywied17/zero-transfer/blob/047adaab6146959fed931c4dae5960a8d04e8ae2/src/profiles/importers/FileZillaImporter.ts#L21) |
