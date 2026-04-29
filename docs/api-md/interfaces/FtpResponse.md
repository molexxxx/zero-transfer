[**ZeroTransfer SDK v0.1.6**](../README.md)

***

[ZeroTransfer SDK](../README.md) / FtpResponse

# Interface: FtpResponse

Defined in: [src/providers/classic/ftp/FtpResponseParser.ts:22](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L22)

Complete parsed FTP response.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `number` | Numeric three-digit FTP reply code. | [src/providers/classic/ftp/FtpResponseParser.ts:24](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L24) |
| <a id="completion"></a> `completion` | `boolean` | Whether the response is a 2xx completion reply. | [src/providers/classic/ftp/FtpResponseParser.ts:36](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L36) |
| <a id="intermediate"></a> `intermediate` | `boolean` | Whether the response is a 3xx intermediate reply. | [src/providers/classic/ftp/FtpResponseParser.ts:38](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L38) |
| <a id="lines"></a> `lines` | `string`[] | Individual message lines without the reply-code prefix. | [src/providers/classic/ftp/FtpResponseParser.ts:28](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L28) |
| <a id="message"></a> `message` | `string` | Response message with multi-line content joined by newlines. | [src/providers/classic/ftp/FtpResponseParser.ts:26](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L26) |
| <a id="permanentfailure"></a> `permanentFailure` | `boolean` | Whether the response is a 5xx permanent failure reply. | [src/providers/classic/ftp/FtpResponseParser.ts:42](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L42) |
| <a id="preliminary"></a> `preliminary` | `boolean` | Whether the response is a 1xx preliminary reply. | [src/providers/classic/ftp/FtpResponseParser.ts:34](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L34) |
| <a id="raw"></a> `raw` | `string` | Raw response lines joined by newlines. | [src/providers/classic/ftp/FtpResponseParser.ts:30](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L30) |
| <a id="status"></a> `status` | [`FtpResponseStatus`](../type-aliases/FtpResponseStatus.md) | Classified response status family. | [src/providers/classic/ftp/FtpResponseParser.ts:32](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L32) |
| <a id="transientfailure"></a> `transientFailure` | `boolean` | Whether the response is a 4xx transient failure reply. | [src/providers/classic/ftp/FtpResponseParser.ts:40](https://github.com/tonywied17/zero-transfer/blob/1030db99db8d8b0f4fe046d8130f1cb5e50dd102/src/providers/classic/ftp/FtpResponseParser.ts#L40) |
