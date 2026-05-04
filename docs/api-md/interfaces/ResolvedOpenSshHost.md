[**ZeroTransfer SDK v0.4.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / ResolvedOpenSshHost

# Interface: ResolvedOpenSshHost

Defined in: [src/profiles/importers/OpenSshConfigImporter.ts:83](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L83)

Resolved set of directives for a given host alias. Values from later-declared blocks are
merged after earlier ones so wildcard fallbacks (e.g. `Host *`) only fill gaps.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="alias"></a> `alias` | `string` | Host alias the lookup was performed against. | [src/profiles/importers/OpenSshConfigImporter.ts:85](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L85) |
| <a id="matched"></a> `matched` | readonly [`OpenSshConfigEntry`](OpenSshConfigEntry.md)[] | Source entries that contributed to the resolved set, in match order. | [src/profiles/importers/OpenSshConfigImporter.ts:89](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L89) |
| <a id="options"></a> `options` | `Readonly`\<`Record`\<`string`, readonly `string`[]\>\> | Per-directive ordered values, keyed by lower-cased directive name. | [src/profiles/importers/OpenSshConfigImporter.ts:87](https://github.com/tonywied17/zero-transfer/blob/4bee5127df8da342eff2f25e80fce7db7a313deb/src/profiles/importers/OpenSshConfigImporter.ts#L87) |
