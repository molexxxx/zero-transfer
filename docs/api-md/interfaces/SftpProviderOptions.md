[**@zero-transfer/sdk**](../README.md)

---

[@zero-transfer/sdk](../README.md) / SftpProviderOptions

# Interface: SftpProviderOptions

Defined in: [src/providers/classic/sftp/SftpProvider.ts:90](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/SftpProvider.ts#L90)

Options used to create an SFTP provider factory.

## Properties

| Property                                      | Type                                                                                                  | Description                                                                                  | Defined in                                                                                                                                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="hosthash"></a> `hostHash?`             | `string`                                                                                              | Hash algorithm used before calling ssh2's host verifier, such as `sha256`.                   | [src/providers/classic/sftp/SftpProvider.ts:92](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/SftpProvider.ts#L92) |
| <a id="hostverifier"></a> `hostVerifier?`     | \| `HostVerifier` \| `SyncHostVerifier` \| `HostFingerprintVerifier` \| `SyncHostFingerprintVerifier` | Host-key verifier passed directly to ssh2 for advanced callers.                              | [src/providers/classic/sftp/SftpProvider.ts:94](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/SftpProvider.ts#L94) |
| <a id="readytimeoutms"></a> `readyTimeoutMs?` | `number`                                                                                              | Default SSH handshake timeout in milliseconds when the profile does not provide `timeoutMs`. | [src/providers/classic/sftp/SftpProvider.ts:96](https://github.com/tonywied17/zero-transfer/blob/228e6788135e03ac23cdff1b250339621f97317b/src/providers/classic/sftp/SftpProvider.ts#L96) |
