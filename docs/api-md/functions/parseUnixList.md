[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / parseUnixList

# Function: parseUnixList()

```ts
function parseUnixList(
   input, 
   directory?, 
   now?): RemoteEntry[];
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:48](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/providers/classic/ftp/FtpListParser.ts#L48)

Parses a Unix-style FTP `LIST` response into normalized remote entries.

This parser covers the common `ls -l` shape returned by classic FTP daemons and
is used as a compatibility fallback when a server does not support MLSD.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `input` | `string` | `undefined` | Raw LIST response body. |
| `directory` | `string` | `"."` | Parent remote directory used to build entry paths. |
| `now` | `Date` | `...` | Reference date used when LIST entries include time but omit year. |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Remote entries excluding `.` and `..` pseudo entries.

## Throws

[ParseError](../classes/ParseError.md) When any non-summary listing line is malformed.
