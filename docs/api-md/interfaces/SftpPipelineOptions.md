[**ZeroTransfer SDK v0.4.8**](../README.md)

***

[ZeroTransfer SDK](../README.md) / SftpPipelineOptions

# Interface: SftpPipelineOptions

Defined in: src/providers/native/sftp/sftpPipeline.ts:30

Tuning for pipelined SFTP transfers.

The default window is 64 requests x 32 KiB = 2 MiB, matching the OpenSSH
client's defaults and the SSH channel window used by the native transport.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="chunkbytes"></a> `chunkBytes?` | `number` | Bytes requested per `SSH_FXP_READ` / written per `SSH_FXP_WRITE`. Defaults to `32768` (32 KiB). Clamped to 240 KiB so every message stays within the 256 KiB SFTP packet cap with framing overhead to spare. | src/providers/native/sftp/sftpPipeline.ts:41 |
| <a id="maxinflight"></a> `maxInFlight?` | `number` | Maximum number of SFTP requests kept in flight. Defaults to `64`. `1` reproduces the serial one-request-at-a-time behavior. | src/providers/native/sftp/sftpPipeline.ts:35 |
