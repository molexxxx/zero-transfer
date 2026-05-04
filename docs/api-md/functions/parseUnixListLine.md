[**ZeroTransfer SDK v0.3.1**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseUnixListLine

# Function: parseUnixListLine()

```ts
function parseUnixListLine(
   line, 
   directory?, 
   now?): RemoteEntry;
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:66](https://github.com/tonywied17/zero-transfer/blob/852251b2b6cc696c7037358436058af38b33f574/src/providers/classic/ftp/FtpListParser.ts#L66)

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
