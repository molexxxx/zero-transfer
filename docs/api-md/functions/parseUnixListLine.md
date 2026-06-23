[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseUnixListLine

# Function: parseUnixListLine()

```ts
function parseUnixListLine(
   line, 
   directory?, 
   now?): RemoteEntry;
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:66](https://github.com/molexxxx/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/providers/classic/ftp/FtpListParser.ts#L66)

Parses one Unix-style FTP `LIST` line.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `line` | `string` | `undefined` | Raw listing line in an `ls -l` compatible format. |
| `directory` | `string` | `"."` | Parent remote directory used to build the entry path. |
| `now` | `Date` | `...` | Reference date used when the line omits a year. |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)

Normalized remote entry with raw LIST metadata retained.

## Throws

[ParseError](../classes/ParseError.md) When the line is not a supported Unix LIST entry.
