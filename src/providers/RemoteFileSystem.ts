/**
 * Provider-neutral remote file-system contract.
 *
 * @module providers/RemoteFileSystem
 */
import type { ListOptions, RemoteEntry, RemoteStat, StatOptions } from "../types/public";

/** Minimal file-system surface shared by provider sessions. */
export interface RemoteFileSystem {
  /** Lists entries for a provider path. */
  list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;
  /** Reads metadata for a provider path. */
  stat(path: string, options?: StatOptions): Promise<RemoteStat>;
}
