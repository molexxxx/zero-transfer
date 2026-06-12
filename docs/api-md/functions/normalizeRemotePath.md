[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / normalizeRemotePath

# Function: normalizeRemotePath()

```ts
function normalizeRemotePath(input): string;
```

Defined in: [src/utils/path.ts:47](https://github.com/tonywied17/zero-transfer/blob/8424cd0c7c0be47b226a0bbed0e1e7449fd465e3/src/utils/path.ts#L47)

Normalizes a remote path using POSIX-style separators without escaping absolute roots.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path that may contain duplicate separators or dot segments. |

## Returns

`string`

A normalized remote path, `/` for absolute root, or `.` for an empty relative path.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the input contains unsafe CR, LF, or NUL characters.
