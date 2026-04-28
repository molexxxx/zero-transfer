[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / parseUnixList

# Function: parseUnixList()

```ts
function parseUnixList(input, directory?, now?): RemoteEntry[];
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:48](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpListParser.ts#L48)

Parses a Unix-style FTP `LIST` response into normalized remote entries.

This parser covers the common `ls -l` shape returned by classic FTP daemons and
is used as a compatibility fallback when a server does not support MLSD.

## Parameters

| Parameter   | Type     | Default value | Description                                                       |
| ----------- | -------- | ------------- | ----------------------------------------------------------------- |
| `input`     | `string` | `undefined`   | Raw LIST response body.                                           |
| `directory` | `string` | `"."`         | Parent remote directory used to build entry paths.                |
| `now`       | `Date`   | `...`         | Reference date used when LIST entries include time but omit year. |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)[]

Remote entries excluding `.` and `..` pseudo entries.

## Throws

[ParseError](../classes/ParseError.md) When any non-summary listing line is malformed.
