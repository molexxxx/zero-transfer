/**
 * Provider-neutral remote file-system contract.
 *
 * @module providers/RemoteFileSystem
 */
import type {
  ListOptions,
  MkdirOptions,
  RemoteEntry,
  RemoteStat,
  RemoveOptions,
  RenameOptions,
  RmdirOptions,
  StatOptions,
} from "../types/public";

/** Minimal file-system surface shared by provider sessions. */
export interface RemoteFileSystem {
  /** Lists entries for a provider path. */
  list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;
  /** Reads metadata for a provider path. */
  stat(path: string, options?: StatOptions): Promise<RemoteStat>;
  /** Removes a file entry when supported by the provider. */
  remove?(path: string, options?: RemoveOptions): Promise<void>;
  /** Renames or moves an entry when supported by the provider. */
  rename?(from: string, to: string, options?: RenameOptions): Promise<void>;
  /** Creates a directory when supported by the provider. */
  mkdir?(path: string, options?: MkdirOptions): Promise<void>;
  /** Removes a directory when supported by the provider. */
  rmdir?(path: string, options?: RmdirOptions): Promise<void>;
}
