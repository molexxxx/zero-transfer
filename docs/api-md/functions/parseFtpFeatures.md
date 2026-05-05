[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseFtpFeatures

# Function: parseFtpFeatures()

```ts
function parseFtpFeatures(input): FtpFeatures;
```

Defined in: [src/providers/classic/ftp/FtpFeatureParser.ts:36](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/providers/classic/ftp/FtpFeatureParser.ts#L36)

Parses FTP FEAT output into a normalized feature set.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` \| `string`[] \| [`FtpResponse`](../interfaces/FtpResponse.md) | Parsed FTP response, raw string, or individual response lines. |

## Returns

[`FtpFeatures`](../interfaces/FtpFeatures.md)

Normalized feature names, raw feature lines, and MLST fact names.
