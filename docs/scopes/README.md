# ZeroTransfer scoped packages

Per-scope documentation for every package in the [`@zero-transfer/*`](../../packages/) family.

| Package                                            | Summary                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| [`@zero-transfer/core`](./core.md)                 | Provider-neutral contracts, transfer engine, queue, profiles, and errors. |
| [`@zero-transfer/classic`](./classic.md)           | FTP, FTPS, and SFTP providers in one install.                             |
| [`@zero-transfer/ftp`](./ftp.md)                   | Classic FTP provider with EPSV/PASV streaming and REST resume.            |
| [`@zero-transfer/ftps`](./ftps.md)                 | Explicit and implicit FTPS with full TLS profile support.                 |
| [`@zero-transfer/sftp`](./sftp.md)                 | SFTP with SSH key auth, known_hosts, and jump-host support.               |
| [`@zero-transfer/http`](./http.md)                 | HTTP(S) and signed-URL provider with ranged downloads.                    |
| [`@zero-transfer/webdav`](./webdav.md)             | WebDAV provider with PROPFIND listings and ranged downloads.              |
| [`@zero-transfer/s3`](./s3.md)                     | S3-compatible storage with SigV4, multipart upload, and resume.           |
| [`@zero-transfer/google-drive`](./google-drive.md) | Google Drive provider with OAuth, folder paths, and md5 checksums.        |
| [`@zero-transfer/dropbox`](./dropbox.md)           | Dropbox provider with content-hash verification.                          |
| [`@zero-transfer/azure-blob`](./azure-blob.md)     | Azure Blob Storage with SAS or AAD bearer auth.                           |
| [`@zero-transfer/mft`](./mft.md)                   | Routes, schedules, audit logs, webhooks, approval gates.                  |

Each page lists the eventual public surface, capability notes, and the examples that exercise it.
