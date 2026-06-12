[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / redactErrorForLogging

# Function: redactErrorForLogging()

```ts
function redactErrorForLogging(error): Record<string, unknown>;
```

Defined in: [src/logging/redaction.ts:119](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/logging/redaction.ts#L119)

Converts an arbitrary thrown value into a JSON-safe, secret-free record.

Structured SDK errors are serialized through their `toJSON()` (which already
redacts details); plain errors contribute name/message/stack-free context;
other values are stringified. Use this at every internal log site that
records a caught error.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `error` | `unknown` | Caught value of unknown shape. |

## Returns

`Record`\<`string`, `unknown`\>

A redacted, JSON-safe object describing the error.
