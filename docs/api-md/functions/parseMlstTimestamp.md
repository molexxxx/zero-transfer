[**ZeroTransfer SDK v0.1.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseMlstTimestamp

# Function: parseMlstTimestamp()

```ts
function parseMlstTimestamp(input): Date | undefined;
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:154](https://github.com/tonywied17/zero-transfer/blob/cf8a23e699b2c758d71686fe9e76b339941cefe7/src/providers/classic/ftp/FtpListParser.ts#L154)

Parses the UTC timestamp format used by MLST/MLSD `modify` facts.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` \| `undefined` | Timestamp text such as `20260427010203.123`. |

## Returns

`Date` \| `undefined`

A UTC Date when the timestamp is valid, otherwise `undefined`.
