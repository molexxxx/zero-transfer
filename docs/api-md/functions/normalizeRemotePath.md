[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / normalizeRemotePath

# Function: normalizeRemotePath()

```ts
function normalizeRemotePath(input): string;
```

Defined in: [src/utils/path.ts:42](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/utils/path.ts#L42)

Normalizes a remote path using POSIX-style separators without escaping absolute roots.

## Parameters

| Parameter | Type     | Description                                                        |
| --------- | -------- | ------------------------------------------------------------------ |
| `input`   | `string` | Remote path that may contain duplicate separators or dot segments. |

## Returns

`string`

A normalized remote path, `/` for absolute root, or `.` for an empty relative path.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When the input contains unsafe CR or LF characters.
