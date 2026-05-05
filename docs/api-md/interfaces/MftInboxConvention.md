[**ZeroTransfer SDK v0.4.5**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftInboxConvention

# Interface: MftInboxConvention

Defined in: [src/mft/conventions.ts:24](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L24)

Inbox layout convention.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath` | `string` | Base inbox directory where files arrive. | [src/mft/conventions.ts:28](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L28) |
| <a id="failedsubdir"></a> `failedSubdir?` | `string` | Subdirectory for failed files. Defaults to `"failed"`. | [src/mft/conventions.ts:32](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L32) |
| <a id="filter"></a> `filter?` | [`MftRouteFilter`](MftRouteFilter.md) | Filter applied to entries discovered under the base path. | [src/mft/conventions.ts:34](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L34) |
| <a id="processedsubdir"></a> `processedSubdir?` | `string` | Subdirectory for processed files. Defaults to `"processed"`. | [src/mft/conventions.ts:30](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L30) |
| <a id="profile"></a> `profile` | [`ConnectionProfile`](ConnectionProfile.md) | Profile used to connect to the inbox provider. | [src/mft/conventions.ts:26](https://github.com/tonywied17/zero-transfer/blob/cfa015b5b1ada51d6e05dc06e48a6f0190e17bf3/src/mft/conventions.ts#L26) |
