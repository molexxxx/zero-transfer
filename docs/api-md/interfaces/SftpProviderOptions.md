[**ZeroTransfer SDK v0.2.0**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpProviderOptions

# Interface: SftpProviderOptions

Defined in: [src/providers/classic/sftp/SftpProvider.ts:96](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/SftpProvider.ts#L96)

Options used to create an SFTP provider factory.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="hosthash"></a> `hostHash?` | `string` | Hash algorithm used before calling ssh2's host verifier, such as `sha256`. | [src/providers/classic/sftp/SftpProvider.ts:98](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/SftpProvider.ts#L98) |
| <a id="hostverifier"></a> `hostVerifier?` | \| `HostVerifier` \| `SyncHostVerifier` \| `HostFingerprintVerifier` \| `SyncHostFingerprintVerifier` | Host-key verifier passed directly to ssh2 for advanced callers. | [src/providers/classic/sftp/SftpProvider.ts:100](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/SftpProvider.ts#L100) |
| <a id="readytimeoutms"></a> `readyTimeoutMs?` | `number` | Default SSH handshake timeout in milliseconds when the profile does not provide `timeoutMs`. | [src/providers/classic/sftp/SftpProvider.ts:102](https://github.com/tonywied17/zero-transfer/blob/129eeb6be5368d092aa8aa3e5e4bf73e00bf0ce1/src/providers/classic/sftp/SftpProvider.ts#L102) |
