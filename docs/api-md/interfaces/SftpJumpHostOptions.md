[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SftpJumpHostOptions

# Interface: SftpJumpHostOptions

Defined in: [src/providers/classic/sftp/jumpHost.ts:19](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/jumpHost.ts#L19)

Options for [createSftpJumpHostSocketFactory](../functions/createSftpJumpHostSocketFactory.md).

## Properties

| Property                                  | Type                                                           | Description                                                                                               | Defined in                                                                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="bastion"></a> `bastion?`           | `ConnectConfig`                                                | Static ssh2 connect configuration for the bastion. Mutually exclusive with [buildBastion](#buildbastion). | [src/providers/classic/sftp/jumpHost.ts:21](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/jumpHost.ts#L21) |
| <a id="buildbastion"></a> `buildBastion?` | (`context`) => `ConnectConfig` \| `Promise`\<`ConnectConfig`\> | Per-connection builder used to refresh credentials before each tunnel attempt.                            | [src/providers/classic/sftp/jumpHost.ts:23](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/jumpHost.ts#L23) |
| <a id="createclient"></a> `createClient?` | () => `Client`                                                 | Optional ssh2 client factory override used in tests.                                                      | [src/providers/classic/sftp/jumpHost.ts:27](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/jumpHost.ts#L27) |
| <a id="logger"></a> `logger?`             | [`ZeroTransferLogger`](ZeroTransferLogger.md)                  | Optional logger used for tunnel diagnostics.                                                              | [src/providers/classic/sftp/jumpHost.ts:25](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/jumpHost.ts#L25) |
