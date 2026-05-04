---
title: Capability matrix
description: What each provider can and can't do — streaming, resume, server-side copy, multipart upload, checksum exposure.
---

Every provider advertises its own [`CapabilitySet`](../../api/interfaces/capabilityset/). The full programmatic matrix is exposed via [`getBuiltinCapabilityMatrix()`](../../api/functions/getbuiltincapabilitymatrix/) and renders to Markdown via [`formatCapabilityMatrixMarkdown()`](../../api/functions/formatcapabilitymatrixmarkdown/).

| Provider     | Streaming | Resume  | Server-side copy | Multipart upload | Checksum exposed |
| ------------ | :-------: | :-----: | :--------------: | :--------------: | :--------------: |
| sftp         |    ✅     |   ✅    |        ❌        |        ❌        |        ❌        |
| ftp          |    ✅     | partial |        ❌        |        ❌        |        ❌        |
| ftps         |    ✅     | partial |        ❌        |        ❌        |        ❌        |
| http         |    ✅     |   ✅    |        ❌        |        ❌        |    if served     |
| webdav       |    ✅     | partial |        ✅        |        ❌        |    if served     |
| s3           |    ✅     |   ✅    |        ✅        |        ✅        |  ETag / SHA256   |
| azure-blob   |    ✅     |   ✅    |        ✅        |        ✅        |   MD5 / CRC64    |
| gcs          |    ✅     |   ✅    |        ✅        |        ✅        |   MD5 / CRC32C   |
| dropbox      |    ✅     |   ❌    |        ✅        |        ✅        |        ✅        |
| google-drive |    ✅     |   ❌    |        ✅        |        ✅        |        ❌        |
| one-drive    |    ✅     |   ❌    |        ✅        |        ✅        |        ✅        |
| local        |    ✅     |   ✅    |        ✅        |        ❌        |        ❌        |
| memory       |    ✅     |   ✅    |        ✅        |        ❌        |        ❌        |

For a live, type-safe view at runtime:

```ts
import { getBuiltinCapabilityMatrix } from "@zero-transfer/sdk";

const matrix = getBuiltinCapabilityMatrix();
console.table(matrix);
```

Operations branch on capabilities at runtime — for example, `copyBetween()` will use server-side copy when both ends support it on the same provider, falling back to a streaming copy otherwise. You don't have to special-case providers in your own code.
