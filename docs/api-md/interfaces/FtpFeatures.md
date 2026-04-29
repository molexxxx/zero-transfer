[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpFeatures

# Interface: FtpFeatures

Defined in: [src/providers/classic/ftp/FtpFeatureParser.ts:14](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpFeatureParser.ts#L14)

Normalized server features returned by an FTP FEAT command.

## Methods

### supports()

```ts
supports(featureName): boolean;
```

Defined in: [src/providers/classic/ftp/FtpFeatureParser.ts:27](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpFeatureParser.ts#L27)

Checks whether a named feature is advertised.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `featureName` | `string` | Feature name to search for, case-insensitively. |

#### Returns

`boolean`

`true` when the feature appears in the FEAT response.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="mlstfacts"></a> `mlstFacts` | `string`[] | MLST facts advertised by the server, preserving required-fact markers. | [src/providers/classic/ftp/FtpFeatureParser.ts:20](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpFeatureParser.ts#L20) |
| <a id="names"></a> `names` | `Set`\<`string`\> | Uppercase feature names for fast lookup. | [src/providers/classic/ftp/FtpFeatureParser.ts:18](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpFeatureParser.ts#L18) |
| <a id="raw"></a> `raw` | `string`[] | Raw normalized feature lines. | [src/providers/classic/ftp/FtpFeatureParser.ts:16](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpFeatureParser.ts#L16) |
