[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactUrlForLogging

# Function: redactUrlForLogging()

```ts
function redactUrlForLogging(url): string;
```

Defined in: [src/logging/redaction.ts:95](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/logging/redaction.ts#L95)

Strips credentials and query/fragment content from a URL before logging.

Query strings routinely carry bearer material - SigV4 `X-Amz-Signature`
values, SAS tokens, signed-URL parameters - so the entire search and hash
segments are replaced rather than filtered key-by-key. Embedded
`user:password@` userinfo is removed. Origin and pathname are preserved
because they are what operators need to correlate a failing request.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` \| `URL` | Absolute URL string or `URL` instance to sanitize. |

## Returns

`string`

A loggable URL string, or [REDACTED](../variables/REDACTED.md) when the value cannot be
parsed as a URL (an unparsable value may still embed credentials).
