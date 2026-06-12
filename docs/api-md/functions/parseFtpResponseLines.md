[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseFtpResponseLines

# Function: parseFtpResponseLines()

```ts
function parseFtpResponseLines(lines): FtpResponse;
```

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:172](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/providers/classic/ftp/FtpResponseParser.ts#L172)

Parses an exact set of response lines into one complete FTP response.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `lines` | `string`[] | Raw response lines without trailing newline delimiters. |

## Returns

[`FtpResponse`](../interfaces/FtpResponse.md)

A single complete parsed FTP response.

## Throws

[ParseError](../classes/ParseError.md) When the lines do not contain exactly one complete response.
