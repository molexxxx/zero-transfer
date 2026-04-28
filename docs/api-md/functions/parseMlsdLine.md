[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / parseMlsdLine

# Function: parseMlsdLine()

```ts
function parseMlsdLine(line, directory?): RemoteEntry;
```

Defined in: [src/providers/classic/ftp/FtpListParser.ts:108](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/ftp/FtpListParser.ts#L108)

Parses a single MLSD or MLST fact line.

## Parameters

| Parameter   | Type     | Default value | Description                                           |
| ----------- | -------- | ------------- | ----------------------------------------------------- |
| `line`      | `string` | `undefined`   | Raw fact line in `fact=value; name` format.           |
| `directory` | `string` | `"."`         | Parent remote directory used to build the entry path. |

## Returns

[`RemoteEntry`](../interfaces/RemoteEntry.md)

A normalized remote entry with parsed facts in `raw` metadata.

## Throws

[ParseError](../classes/ParseError.md) When the line does not contain facts and a name.
