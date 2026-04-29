[**ZeroTransfer SDK v0.1.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseFtpFeatures

# Function: parseFtpFeatures()

```ts
function parseFtpFeatures(input): FtpFeatures;
```

Defined in: [src/providers/classic/ftp/FtpFeatureParser.ts:36](https://github.com/tonywied17/zero-transfer/blob/9c538dfa994368eb539b24fbf6f1c32f72785ec0/src/providers/classic/ftp/FtpFeatureParser.ts#L36)

Parses FTP FEAT output into a normalized feature set.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` \| `string`[] \| [`FtpResponse`](../interfaces/FtpResponse.md) | Parsed FTP response, raw string, or individual response lines. |

## Returns

[`FtpFeatures`](../interfaces/FtpFeatures.md)

Normalized feature names, raw feature lines, and MLST fact names.
