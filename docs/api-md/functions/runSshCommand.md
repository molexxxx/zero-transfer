[**ZeroTransfer SDK v0.5.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / runSshCommand

# Function: runSshCommand()

```ts
function runSshCommand(options): Promise<RunSshCommandResult>;
```

Defined in: [src/protocols/ssh/runSshCommand.ts:86](https://github.com/tonywied17/zero-transfer/blob/483be946776ae5d15052263833efbd26b98c4f23/src/protocols/ssh/runSshCommand.ts#L86)

Connects, authenticates, runs `command` on a fresh exec channel, drains
stdout, and disconnects. The TCP socket, transport, auth session, and
channel are all owned by this helper and torn down before it returns.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`RunSshCommandOptions`](../interfaces/RunSshCommandOptions.md) |

## Returns

`Promise`\<[`RunSshCommandResult`](../interfaces/RunSshCommandResult.md)\>

## Example

```ts
import { runSshCommand } from "@zero-transfer/ssh";

const { stdoutText } = await runSshCommand({
  host: "ssh.example.com",
  auth: { type: "password", username: "deploy", password: process.env.SSH_PASSWORD! },
  command: "uname -a",
});
console.log(stdoutText);
```
