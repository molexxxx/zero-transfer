[**ZeroTransfer SDK v0.4.2**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SshDisconnectReason

# Variable: SshDisconnectReason

```ts
const SshDisconnectReason: {
  AUTH_CANCELLED_BY_USER: 13;
  BY_APPLICATION: 11;
  COMPRESSION_ERROR: 6;
  CONNECTION_LOST: 10;
  HOST_KEY_NOT_VERIFIABLE: 9;
  HOST_NOT_ALLOWED_TO_CONNECT: 1;
  ILLEGAL_USER_NAME: 15;
  KEY_EXCHANGE_FAILED: 3;
  MAC_ERROR: 5;
  NO_MORE_AUTH_METHODS: 14;
  PROTOCOL_ERROR: 2;
  PROTOCOL_VERSION_NOT_SUPPORTED: 8;
  SERVICE_NOT_AVAILABLE: 7;
  TOO_MANY_CONNECTIONS: 12;
};
```

Defined in: [src/protocols/ssh/transport/SshTransportConnection.ts:15](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L15)

Standard SSH disconnect reason codes (RFC 4253 §11.1).

## Type Declaration

| Name | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-auth_cancelled_by_user"></a> `AUTH_CANCELLED_BY_USER` | `13` | `13` | [src/protocols/ssh/transport/SshTransportConnection.ts:27](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L27) |
| <a id="property-by_application"></a> `BY_APPLICATION` | `11` | `11` | [src/protocols/ssh/transport/SshTransportConnection.ts:25](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L25) |
| <a id="property-compression_error"></a> `COMPRESSION_ERROR` | `6` | `6` | [src/protocols/ssh/transport/SshTransportConnection.ts:20](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L20) |
| <a id="property-connection_lost"></a> `CONNECTION_LOST` | `10` | `10` | [src/protocols/ssh/transport/SshTransportConnection.ts:24](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L24) |
| <a id="property-host_key_not_verifiable"></a> `HOST_KEY_NOT_VERIFIABLE` | `9` | `9` | [src/protocols/ssh/transport/SshTransportConnection.ts:23](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L23) |
| <a id="property-host_not_allowed_to_connect"></a> `HOST_NOT_ALLOWED_TO_CONNECT` | `1` | `1` | [src/protocols/ssh/transport/SshTransportConnection.ts:16](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L16) |
| <a id="property-illegal_user_name"></a> `ILLEGAL_USER_NAME` | `15` | `15` | [src/protocols/ssh/transport/SshTransportConnection.ts:29](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L29) |
| <a id="property-key_exchange_failed"></a> `KEY_EXCHANGE_FAILED` | `3` | `3` | [src/protocols/ssh/transport/SshTransportConnection.ts:18](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L18) |
| <a id="property-mac_error"></a> `MAC_ERROR` | `5` | `5` | [src/protocols/ssh/transport/SshTransportConnection.ts:19](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L19) |
| <a id="property-no_more_auth_methods"></a> `NO_MORE_AUTH_METHODS` | `14` | `14` | [src/protocols/ssh/transport/SshTransportConnection.ts:28](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L28) |
| <a id="property-protocol_error"></a> `PROTOCOL_ERROR` | `2` | `2` | [src/protocols/ssh/transport/SshTransportConnection.ts:17](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L17) |
| <a id="property-protocol_version_not_supported"></a> `PROTOCOL_VERSION_NOT_SUPPORTED` | `8` | `8` | [src/protocols/ssh/transport/SshTransportConnection.ts:22](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L22) |
| <a id="property-service_not_available"></a> `SERVICE_NOT_AVAILABLE` | `7` | `7` | [src/protocols/ssh/transport/SshTransportConnection.ts:21](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L21) |
| <a id="property-too_many_connections"></a> `TOO_MANY_CONNECTIONS` | `12` | `12` | [src/protocols/ssh/transport/SshTransportConnection.ts:26](https://github.com/tonywied17/zero-transfer/blob/f871bd1a1c01caee1df080b7e6cf2b4686fe7ef7/src/protocols/ssh/transport/SshTransportConnection.ts#L26) |
