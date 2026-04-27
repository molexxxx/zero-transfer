/**
 * Shared protocol adapter contract used by the ZeroFTP facade.
 *
 * Protocol-specific implementations for FTP, FTPS, and SFTP should conform to this
 * interface so high-level client code can remain protocol-neutral.
 *
 * @module protocols/RemoteFileAdapter
 */
import type {
  ConnectionProfile,
  ListOptions,
  RemoteEntry,
  RemoteStat,
  StatOptions,
} from "../types/public";

/**
 * Minimal remote-file adapter required by the current alpha facade.
 */
export interface RemoteFileAdapter {
  /**
   * Opens a remote connection.
   *
   * @param profile - Host, authentication, protocol, timeout, signal, and logger settings.
   * @returns A promise that resolves when the remote session is ready for operations.
   */
  connect(profile: ConnectionProfile): Promise<void>;

  /**
   * Closes the remote connection and releases protocol resources.
   *
   * @returns A promise that resolves when the remote session is fully closed.
   */
  disconnect(): Promise<void>;

  /**
   * Lists entries for a remote directory.
   *
   * @param path - Remote directory path to list.
   * @param options - Optional listing controls such as recursion and abort signal.
   * @returns Normalized remote entries contained by the requested path.
   */
  list(path: string, options?: ListOptions): Promise<RemoteEntry[]>;

  /**
   * Reads metadata for a remote entry.
   *
   * @param path - Remote path to inspect.
   * @param options - Optional stat controls such as abort signal.
   * @returns Normalized metadata for an existing remote entry.
   */
  stat(path: string, options?: StatOptions): Promise<RemoteStat>;
}
