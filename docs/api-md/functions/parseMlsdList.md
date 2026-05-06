[**ZeroTransfer SDK v0.4.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseMlsdList

# Function: parseMlsdList()

```ts
function parseMlsdList(input, directory?): RemoteEntry[];
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:27](https://github.com/tonywied17/zero-transfer/blob/5215796cfdc2e79e8f55ee271567646774058098/src/providers/classic/ftp/FtpListParser.ts#L27)

Parses an MLSD directory listing into normalized remote entries.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `input` | `string` | `undefined` | Raw MLSD response body. |
| `directory` | `string` | `"."` | Parent remote directory used to build entry paths. |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Remote entries excluding the `.` and `..` pseudo entries.

## Throws

[ParseError](../classes/ParseError.md) When any listing line is malformed.
