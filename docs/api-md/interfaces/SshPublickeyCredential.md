[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshPublickeyCredential

# Interface: SshPublickeyCredential

Defined in: [src/protocols/ssh/auth/SshAuthSession.ts:45](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/auth/SshAuthSession.ts#L45)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="algorithmname"></a> `algorithmName` | `string` | - | [src/protocols/ssh/auth/SshAuthSession.ts:48](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/auth/SshAuthSession.ts#L48) |
| <a id="publickeyblob"></a> `publicKeyBlob` | `Uint8Array` | Raw public key blob in SSH wire format (e.g. the bytes returned by ssh-keygen -e -f key.pub). | [src/protocols/ssh/auth/SshAuthSession.ts:50](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/auth/SshAuthSession.ts#L50) |
| <a id="sign"></a> `sign` | (`data`) => \| `Uint8Array`\<`ArrayBufferLike`\> \| `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\> | Signs the challenge data. The data is already the complete sign-data per RFC 4252 §7. Should return the signature blob (without algorithm prefix; caller adds wrapping). | [src/protocols/ssh/auth/SshAuthSession.ts:55](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/auth/SshAuthSession.ts#L55) |
| <a id="type"></a> `type` | `"publickey"` | - | [src/protocols/ssh/auth/SshAuthSession.ts:46](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/auth/SshAuthSession.ts#L46) |
| <a id="username"></a> `username` | `string` | - | [src/protocols/ssh/auth/SshAuthSession.ts:47](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/protocols/ssh/auth/SshAuthSession.ts#L47) |
