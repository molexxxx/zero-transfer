/**
 * @zero-transfer/http entry point.
 *
 * Read-only HTTP(S) provider with ranged GET, Basic/Bearer auth, and
 * ETag-based checksums. Includes the complete @zero-transfer/core surface.
 *
 * @module @zero-transfer/http
 */
export * from "./core";
export {
  createHttpProviderFactory,
  type HttpFetch,
  type HttpProviderOptions,
} from "../providers/web/HttpProvider";
