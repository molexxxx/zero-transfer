[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ImportOpenSshConfigResult

# Interface: ImportOpenSshConfigResult

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:149](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/OpenSshConfigImporter.ts#L149)

Result of [importOpenSshConfig](../functions/importOpenSshConfig.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="identityfiles"></a> `identityFiles` | readonly `string`[] | Identity file paths declared in the config, in declaration order. | [src/profiles/importers/OpenSshConfigImporter.ts:155](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/OpenSshConfigImporter.ts#L155) |
| <a id="profile"></a> `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Generated SFTP connection profile. | [src/profiles/importers/OpenSshConfigImporter.ts:151](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/OpenSshConfigImporter.ts#L151) |
| <a id="proxyjump"></a> `proxyJump?` | `string` | Optional `ProxyJump` value preserved from the config. | [src/profiles/importers/OpenSshConfigImporter.ts:157](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/OpenSshConfigImporter.ts#L157) |
| <a id="resolved"></a> `resolved` | [`ResolvedOpenSshHost`](ResolvedOpenSshHost.md) | Resolved directive set used to build the profile. | [src/profiles/importers/OpenSshConfigImporter.ts:153](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/profiles/importers/OpenSshConfigImporter.ts#L153) |
