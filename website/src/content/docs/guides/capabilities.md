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

- `resume↑` (resume upload) maps to provider-managed multipart / staged-block / resumable-session uploads. S3, Azure Blob, GCS, and OneDrive enable that path by default for payloads above their respective `multipart.thresholdBytes` (8 MiB for Azure/GCS/S3, 4 MiB for OneDrive); S3 and Azure additionally upload parts in parallel (`partConcurrency: 4` by default). Dropbox and Google Drive also stream large payloads through chunked sessions by default (8 MiB threshold), but do not yet support resuming those sessions across attempts - hence their ❌. Pass `multipart: { enabled: false }` on any factory to force single-shot uploads.
- A `resume↓` source plus a `resume↑` destination is what makes [checkpointed resume](../../concepts/transfers/#checkpoints-and-resume) possible: configure `resume: { store }` and interrupted transfers continue from the committed watermark across retries and process restarts.
- `server-side copy/move` means the provider can perform the operation on the backend without streaming bytes through the client. No built-in provider implements this yet - the flags exist in the capability model, but every copy today streams through your machine via [`copyBetween()`](../../api/functions/copybetween/), which works across any provider pair. Backend fast paths (S3 `CopyObject`, WebDAV `COPY`/`MOVE`, OpenSSH's `copy-data` SFTP extension, the cloud-drive copy endpoints) are on the roadmap; the column will flip to ✅ per provider as each lands.
- `checksums` is the sourced checksum format(s) the provider can surface; the engine verifies whichever one the read side returns.

For a live, type-safe view at runtime:

```ts
import { getBuiltinCapabilityMatrix } from "@zero-transfer/sdk";

const matrix = getBuiltinCapabilityMatrix();
console.table(matrix);
```

Operations branch on capabilities at runtime - for example, the engine consults `resumeDownload`/`resumeUpload` before attempting ranged or multipart transfers, and resume-capable uploads switch on automatically above the provider's multipart threshold. You don't have to special-case providers in your own code.
