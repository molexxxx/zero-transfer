[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / createSftpJumpHostSocketFactory

# Function: createSftpJumpHostSocketFactory()

```ts
function createSftpJumpHostSocketFactory(options): SshSocketFactory;
```

Defined in: [src/providers/classic/sftp/jumpHost.ts:38](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/jumpHost.ts#L38)

Builds an [SshSocketFactory](../type-aliases/SshSocketFactory.md) that tunnels SFTP connections through a bastion host.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`SftpJumpHostOptions`](../interfaces/SftpJumpHostOptions.md) | Bastion configuration and overrides. |

## Returns

[`SshSocketFactory`](../type-aliases/SshSocketFactory.md)

Factory that returns a forwarded ssh2 channel stream when invoked.

## Throws

[ConfigurationError](../classes/ConfigurationError.md) When neither [SftpJumpHostOptions.bastion](../interfaces/SftpJumpHostOptions.md#bastion) nor [SftpJumpHostOptions.buildBastion](../interfaces/SftpJumpHostOptions.md#buildbastion) is supplied.
