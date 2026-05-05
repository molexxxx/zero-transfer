---
title: Capability matrix
description: What each provider can and can't do - streaming, resume, server-side copy, multipart upload, checksum exposure.
---

Every provider advertises its own [`CapabilitySet`](../../api/interfaces/capabilityset/). The full programmatic matrix is exposed via [`getBuiltinCapabilityMatrix()`](../../api/functions/getbuiltincapabilitymatrix/) and renders to Markdown via [`formatCapabilityMatrixMarkdown()`](../../api/functions/formatcapabilitymatrixmarkdown/).

The table below is the canonical output of `formatCapabilityMatrixMarkdown()` so it never drifts from the live `CapabilitySet` values:

| Provider                                   | list | stat | read | write | resume↓ | resume↑ | server-side copy/move | checksums                  | auth                                      |
| ------------------------------------------ | ---- | ---- | ---- | ----- | ------- | ------- | --------------------- | -------------------------- | ----------------------------------------- |
| Local file system                          | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | -                          | anonymous                                 |
| In-memory (test fixture)                   | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | -                          | anonymous                                 |
| FTP                                        | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | -                          | anonymous, password                       |
| FTPS                                       | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | -                          | anonymous, password, client-certificate   |
| SFTP                                       | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | -                          | password, keyboard-interactive, publickey |
| HTTP/HTTPS (read-only)                     | ❌   | ✅   | ✅   | ❌    | ✅      | ❌      | ❌ / ❌               | etag                       | anonymous, password, token                |
| WebDAV                                     | ✅   | ✅   | ✅   | ✅    | ✅      | ❌      | ❌ / ❌               | etag                       | anonymous, password, token                |
| S3-compatible (multipart uploads, default) | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | etag                       | password, token                           |
| S3-compatible (single-shot uploads)        | ✅   | ✅   | ✅   | ✅    | ✅      | ❌      | ❌ / ❌               | etag                       | password, token                           |
| Dropbox                                    | ✅   | ✅   | ✅   | ✅    | ✅      | ❌      | ❌ / ❌               | dropbox-content-hash       | token, oauth                              |
| Google Drive                               | ✅   | ✅   | ✅   | ✅    | ✅      | ❌      | ❌ / ❌               | md5, sha256, crc32c        | token, oauth                              |
| OneDrive / SharePoint                      | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | sha1, sha256, quickxorhash | token, oauth                              |
| Azure Blob Storage                         | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | md5                        | token, oauth                              |
| Google Cloud Storage                       | ✅   | ✅   | ✅   | ✅    | ✅      | ✅      | ❌ / ❌               | md5, crc32c                | token, oauth                              |

Notes:

- `resume↑` (resume upload) maps to provider-managed multipart / staged-block / resumable-session uploads. As of 0.4.6, S3, Azure Blob, GCS, and OneDrive all enable that path by default for payloads above their respective `multipart.thresholdBytes` (8 MiB for Azure/GCS/S3, 4 MiB for OneDrive). Pass `multipart: { enabled: false }` on the factory to force single-shot uploads.
- `server-side copy/move` reflects whether the provider can perform the operation atomically on the backend without streaming bytes through the client. Several providers (WebDAV `COPY`, SFTP `rename`) accept the operation but do not advertise it as a first-class capability yet; see [`copyBetween()`](../../api/functions/copybetween/) for the streaming fallback that always works.
- `checksums` is the sourced checksum format(s) the provider can surface; the engine verifies whichever one the read side returns.

For a live, type-safe view at runtime:

```ts
import { getBuiltinCapabilityMatrix } from "@zero-transfer/sdk";

const matrix = getBuiltinCapabilityMatrix();
console.table(matrix);
```

Operations branch on capabilities at runtime - for example, `copyBetween()` will use server-side copy when both ends support it on the same provider, falling back to a streaming copy otherwise. You don't have to special-case providers in your own code.
