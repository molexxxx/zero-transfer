/**
 * @zero-transfer/webdav entry point.
 *
 * WebDAV provider with PROPFIND listings, ranged GET, and PUT uploads.
 * Includes the complete @zero-transfer/core surface.
 *
 * @module @zero-transfer/webdav
 */
export * from "./core";
export {
  createWebDavProviderFactory,
  type WebDavProviderOptions,
} from "../providers/web/WebDavProvider";
