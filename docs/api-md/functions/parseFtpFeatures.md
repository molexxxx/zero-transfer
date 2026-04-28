[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / parseFtpFeatures

# Function: parseFtpFeatures()

```ts
function parseFtpFeatures(input): FtpFeatures;
```

Defined in: [src/providers/classic/ftp/FtpFeatureParser.ts:36](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpFeatureParser.ts#L36)

Parses FTP FEAT output into a normalized feature set.

## Parameters

| Parameter | Type                                                                    | Description                                                    |
| --------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `input`   | `string` \| `string`[] \| [`FtpResponse`](../interfaces/FtpResponse.md) | Parsed FTP response, raw string, or individual response lines. |

## Returns

[`FtpFeatures`](../interfaces/FtpFeatures.md)

Normalized feature names, raw feature lines, and MLST fact names.
