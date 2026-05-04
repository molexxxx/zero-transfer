/**
 * @zero-transfer/s3 entry point.
 *
 * S3-compatible object storage with SigV4 signing, multipart upload, and
 * cross-process resume. Includes the complete @zero-transfer/core surface.
 *
 * @module @zero-transfer/s3
 */
export * from "./core";
export {
  createS3ProviderFactory,
  createFileSystemS3MultipartResumeStore,
  createMemoryS3MultipartResumeStore,
  type FileSystemS3MultipartResumeStoreOptions,
  type S3MultipartCheckpoint,
  type S3MultipartOptions,
  type S3MultipartPart,
  type S3MultipartResumeKey,
  type S3MultipartResumeStore,
  type S3ProviderOptions,
} from "../providers/web/S3Provider";
