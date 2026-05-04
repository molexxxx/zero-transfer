[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpJumpHostOptions

# Interface: SftpJumpHostOptions

Defined in: [src/providers/classic/sftp/jumpHost.ts:20](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/jumpHost.ts#L20)

Options for [createSftpJumpHostSocketFactory](../functions/createSftpJumpHostSocketFactory.md).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bastion"></a> `bastion?` | `ConnectConfig` | Static ssh2 connect configuration for the bastion. Mutually exclusive with [buildBastion](#buildbastion). | [src/providers/classic/sftp/jumpHost.ts:22](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/jumpHost.ts#L22) |
| <a id="buildbastion"></a> `buildBastion?` | (`context`) => `ConnectConfig` \| `Promise`\<`ConnectConfig`\> | Per-connection builder used to refresh credentials before each tunnel attempt. | [src/providers/classic/sftp/jumpHost.ts:24](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/jumpHost.ts#L24) |
| <a id="createclient"></a> `createClient?` | () => `Client` | Optional ssh2 client factory override used in tests. | [src/providers/classic/sftp/jumpHost.ts:28](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/jumpHost.ts#L28) |
| <a id="logger"></a> `logger?` | [`ZeroTransferLogger`](ZeroTransferLogger.md) | Optional logger used for tunnel diagnostics. | [src/providers/classic/sftp/jumpHost.ts:26](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/jumpHost.ts#L26) |
