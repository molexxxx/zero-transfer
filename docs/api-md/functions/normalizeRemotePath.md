[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / normalizeRemotePath

# Function: normalizeRemotePath()

```ts
function normalizeRemotePath(input): string;
```

Defined in: [src/utils/path.ts:42](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/utils/path.ts#L42)

Normalizes a remote path using POSIX-style separators without escaping absolute roots.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | Remote path that may contain duplicate separators or dot segments. |

## Returns

`string`

A normalized remote path, `/` for absolute root, or `.` for an empty relative path.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the input contains unsafe CR or LF characters.
