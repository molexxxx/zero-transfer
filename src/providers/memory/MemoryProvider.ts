/**
 * Deterministic in-memory provider for contract and unit tests.
 *
 * @module providers/memory/MemoryProvider
 */
import { Buffer } from "node:buffer";
import type { CapabilitySet } from "../../core/CapabilitySet";
import type { TransferSession } from "../../core/TransferSession";
import { ConfigurationError, PathNotFoundError } from "../../errors/ZeroTransferError";
import type { TransferVerificationResult } from "../../transfers/TransferJob";
import type { ProviderFactory } from "../ProviderFactory";
import type { TransferProvider } from "../Provider";
import type {
  ProviderTransferOperations,
  ProviderTransferReadRequest,
  ProviderTransferReadResult,
  ProviderTransferWriteRequest,
  ProviderTransferWriteResult,
} from "../ProviderTransferOperations";
import type { RemoteFileSystem } from "../RemoteFileSystem";
import type {
  MkdirOptions,
  RemoteEntry,
  RemotePermissions,
  RemoteStat,
  RemoveOptions,
  RmdirOptions,
} from "../../types/public";
import { basenameRemotePath, normalizeRemotePath } from "../../utils/path";

const MEMORY_PROVIDER_ID = "memory";

const MEMORY_PROVIDER_CAPABILITIES: CapabilitySet = {
  provider: MEMORY_PROVIDER_ID,
  authentication: ["anonymous"],
  list: true,
  stat: true,
  readStream: true,
  writeStream: true,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: true,
  resumeUpload: true,
  checksum: [],
  atomicRename: false,
  chmod: false,
  chown: false,
  symlink: true,
  metadata: [
    "accessedAt",
    "createdAt",
    "group",
    "modifiedAt",
    "owner",
    "permissions",
    "symlinkTarget",
    "uniqueId",
  ],
  maxConcurrency: 32,
  notes: ["Deterministic in-memory provider for tests and provider contract validation"],
};

/** Fixture entry used to seed a memory provider instance. */
export interface MemoryProviderEntry extends Omit<RemoteEntry, "name"> {
  /** Entry basename. When omitted, it is derived from `path`. */
  name?: string;
  /** Optional byte content for file entries. Strings are encoded as UTF-8. */
  content?: string | Uint8Array;
}

/** Options used to create a deterministic memory provider factory. */
export interface MemoryProviderOptions {
  /** Entries available to sessions created by this provider factory. */
  entries?: Iterable<MemoryProviderEntry>;
}

/**
 * Creates a provider factory backed by deterministic in-memory fixture entries.
 *
 * @param options - Optional fixture entries to expose through the memory provider.
 * @returns Provider factory suitable for `createTransferClient({ providers: [...] })`.
 */
export function createMemoryProviderFactory(options: MemoryProviderOptions = {}): ProviderFactory {
  const state = createMemoryState(options.entries ?? []);

  return {
    id: MEMORY_PROVIDER_ID,
    capabilities: MEMORY_PROVIDER_CAPABILITIES,
    create: () => new MemoryProvider(state),
  };
}

class MemoryProvider implements TransferProvider {
  readonly id = MEMORY_PROVIDER_ID;
  readonly capabilities = MEMORY_PROVIDER_CAPABILITIES;

  constructor(private readonly state: MemoryProviderState) {}

  connect(): Promise<TransferSession> {
    return Promise.resolve(new MemoryTransferSession(this.state));
  }
}

class MemoryTransferSession implements TransferSession {
  readonly provider = MEMORY_PROVIDER_ID;
  readonly capabilities = MEMORY_PROVIDER_CAPABILITIES;
  readonly fs: RemoteFileSystem;
  readonly transfers: ProviderTransferOperations;

  constructor(state: MemoryProviderState) {
    this.fs = new MemoryFileSystem(state);
    this.transfers = new MemoryTransferOperations(state);
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

interface MemoryProviderState {
  entries: Map<string, RemoteStat>;
  content: Map<string, Uint8Array>;
}

class MemoryFileSystem implements RemoteFileSystem {
  constructor(private readonly state: MemoryProviderState) {}

  list(path: string): Promise<RemoteEntry[]> {
    return Promise.resolve().then(() => {
      const normalizedPath = normalizeMemoryPath(path);
      const directory = this.requireEntry(normalizedPath);

      if (directory.type !== "directory") {
        throw createPathNotFoundError(
          normalizedPath,
          `Memory path is not a directory: ${normalizedPath}`,
        );
      }

      return [...this.state.entries.values()]
        .filter(
          (entry) => entry.path !== normalizedPath && getParentPath(entry.path) === normalizedPath,
        )
        .map(cloneRemoteEntry)
        .sort(compareEntries);
    });
  }

  stat(path: string): Promise<RemoteStat> {
    return Promise.resolve().then(() =>
      cloneRemoteStat(this.requireEntry(normalizeMemoryPath(path))),
    );
  }

  remove(path: string, options: RemoveOptions = {}): Promise<void> {
    return Promise.resolve().then(() => {
      const normalized = normalizeMemoryPath(path);
      const entry = this.state.entries.get(normalized);
      if (entry === undefined) {
        if (options.ignoreMissing) return;
        throw createPathNotFoundError(normalized, `Memory path not found: ${normalized}`);
      }
      if (entry.type === "directory") {
        throw createPathNotFoundError(
          normalized,
          `Memory path is a directory; use rmdir: ${normalized}`,
        );
      }
      this.state.entries.delete(normalized);
      this.state.content.delete(normalized);
    });
  }

  rename(from: string, to: string): Promise<void> {
    return Promise.resolve().then(() => {
      const fromPath = normalizeMemoryPath(from);
      const toPath = normalizeMemoryPath(to);
      const entry = this.state.entries.get(fromPath);
      if (entry === undefined) {
        throw createPathNotFoundError(fromPath, `Memory path not found: ${fromPath}`);
      }
      ensureParentDirectories(this.state.entries, toPath);
      const moved: RemoteStat = { ...entry, path: toPath, name: basenameRemotePath(toPath) };
      this.state.entries.delete(fromPath);
      this.state.entries.set(toPath, moved);
      const content = this.state.content.get(fromPath);
      if (content !== undefined) {
        this.state.content.delete(fromPath);
        this.state.content.set(toPath, content);
      }
    });
  }

  mkdir(path: string, options: MkdirOptions = {}): Promise<void> {
    return Promise.resolve().then(() => {
      const normalized = normalizeMemoryPath(path);
      const existing = this.state.entries.get(normalized);
      if (existing !== undefined) {
        if (existing.type === "directory" && options.recursive) return;
        throw createInvalidFixtureError(normalized, `Memory path already exists: ${normalized}`);
      }
      if (options.recursive) {
        ensureParentDirectories(this.state.entries, normalized);
      } else {
        const parent = getParentPath(normalized);
        if (parent !== undefined && !this.state.entries.has(parent)) {
          throw createPathNotFoundError(parent, `Memory parent not found: ${parent}`);
        }
      }
      this.state.entries.set(normalized, createDirectoryEntry(normalized));
    });
  }

  rmdir(path: string, options: RmdirOptions = {}): Promise<void> {
    return Promise.resolve().then(() => {
      const normalized = normalizeMemoryPath(path);
      const entry = this.state.entries.get(normalized);
      if (entry === undefined) {
        if (options.ignoreMissing) return;
        throw createPathNotFoundError(normalized, `Memory path not found: ${normalized}`);
      }
      if (entry.type !== "directory") {
        throw createPathNotFoundError(normalized, `Memory path is not a directory: ${normalized}`);
      }
      const children = [...this.state.entries.values()].filter(
        (child) => child.path !== normalized && getParentPath(child.path) === normalized,
      );
      if (children.length > 0 && !options.recursive) {
        throw createInvalidFixtureError(normalized, `Memory directory not empty: ${normalized}`);
      }
      const stack = [...children];
      while (stack.length > 0) {
        const next = stack.pop();
        if (!next) continue;
        if (next.type === "directory") {
          for (const grand of this.state.entries.values()) {
            if (grand.path !== next.path && getParentPath(grand.path) === next.path) {
              stack.push(grand);
            }
          }
        }
        this.state.entries.delete(next.path);
        this.state.content.delete(next.path);
      }
      this.state.entries.delete(normalized);
    });
  }

  private requireEntry(path: string): RemoteStat {
    const entry = this.state.entries.get(path);

    if (entry === undefined) {
      throw createPathNotFoundError(path, `Memory path not found: ${path}`);
    }

    return entry;
  }
}

class MemoryTransferOperations implements ProviderTransferOperations {
  constructor(private readonly state: MemoryProviderState) {}

  read(request: ProviderTransferReadRequest): Promise<ProviderTransferReadResult> {
    return Promise.resolve().then(() => {
      request.throwIfAborted();
      const path = normalizeMemoryPath(request.endpoint.path);
      const entry = requireFileEntry(this.state, path);
      const content = this.state.content.get(path) ?? new Uint8Array(entry.size ?? 0);
      const range = resolveByteRange(content.byteLength, request.range);
      const chunk = content.slice(range.offset, range.offset + range.length);
      const result: ProviderTransferReadResult = {
        content: createMemoryContentSource(chunk),
        totalBytes: chunk.byteLength,
      };

      if (range.offset > 0) {
        result.bytesRead = range.offset;
      }

      return result;
    });
  }

  async write(request: ProviderTransferWriteRequest): Promise<ProviderTransferWriteResult> {
    request.throwIfAborted();
    const path = normalizeMemoryPath(request.endpoint.path);
    const existing = this.state.entries.get(path);

    if (existing?.type === "directory") {
      throw createInvalidFixtureError(path, `Memory path is a directory: ${path}`);
    }

    const writtenContent = await collectTransferContent(request);
    const offset = normalizeOptionalByteCount(request.offset, "offset");
    const previousContent = this.state.content.get(path) ?? new Uint8Array(0);
    const content =
      offset === undefined
        ? writtenContent
        : mergeContentAtOffset(previousContent, writtenContent, offset);

    ensureParentDirectories(this.state.entries, path);
    this.state.entries.set(path, createWrittenFileEntry(path, content.byteLength));
    this.state.content.set(path, content);

    const result: ProviderTransferWriteResult = {
      bytesTransferred: writtenContent.byteLength,
      resumed: offset !== undefined && offset > 0,
      totalBytes: content.byteLength,
      verified: request.verification?.verified ?? false,
    };

    if (request.verification !== undefined) {
      result.verification = cloneVerification(request.verification);
    }

    return result;
  }
}

function createMemoryState(entries: Iterable<MemoryProviderEntry>): MemoryProviderState {
  const state: MemoryProviderState = {
    content: new Map(),
    entries: new Map([["/", createDirectoryEntry("/")]]),
  };

  for (const input of entries) {
    const entry = createMemoryEntry(input);
    const content = createMemoryContent(input, entry);

    if (entry.path === "/" && entry.type !== "directory") {
      throw createInvalidFixtureError(entry.path, "Memory provider root must be a directory");
    }

    ensureParentDirectories(state.entries, entry.path);
    state.entries.set(entry.path, entry);

    if (content !== undefined) {
      state.content.set(entry.path, content);
    }
  }

  return state;
}

function createMemoryEntry(input: MemoryProviderEntry): RemoteStat {
  const path = normalizeMemoryPath(input.path);
  const entry: RemoteEntry = {
    name: input.name ?? basenameRemotePath(path),
    path,
    type: input.type,
  };

  copyOptionalEntryFields(entry, input);

  const content = normalizeMemoryContent(input.content);

  if (content !== undefined) {
    entry.size = content.byteLength;
  }

  return {
    ...entry,
    exists: true,
  };
}

function createMemoryContent(
  input: MemoryProviderEntry,
  entry: RemoteStat,
): Uint8Array | undefined {
  const content = normalizeMemoryContent(input.content);

  if (content !== undefined) {
    if (entry.type !== "file") {
      throw createInvalidFixtureError(
        entry.path,
        `Memory fixture content requires a file: ${entry.path}`,
      );
    }

    return content;
  }

  if (entry.type === "file") {
    return new Uint8Array(entry.size ?? 0);
  }

  return undefined;
}

function normalizeMemoryContent(content: string | Uint8Array | undefined): Uint8Array | undefined {
  if (content === undefined) {
    return undefined;
  }

  return typeof content === "string" ? Buffer.from(content) : new Uint8Array(content);
}

function createWrittenFileEntry(path: string, size: number): RemoteStat {
  return {
    exists: true,
    modifiedAt: new Date(),
    name: basenameRemotePath(path),
    path,
    size,
    type: "file",
  };
}

function createDirectoryEntry(path: string): RemoteStat {
  return {
    exists: true,
    name: basenameRemotePath(path),
    path,
    type: "directory",
  };
}

function ensureParentDirectories(state: Map<string, RemoteStat>, path: string): void {
  for (const parentPath of getAncestorPaths(path)) {
    const parent = state.get(parentPath);

    if (parent !== undefined && parent.type !== "directory") {
      throw createInvalidFixtureError(
        parentPath,
        `Memory fixture parent is not a directory: ${parentPath}`,
      );
    }

    if (parent === undefined) {
      state.set(parentPath, createDirectoryEntry(parentPath));
    }
  }
}

function normalizeMemoryPath(path: string): string {
  const normalized = normalizeRemotePath(path);

  if (normalized === "." || normalized === "/") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function getAncestorPaths(path: string): string[] {
  const ancestors: string[] = [];
  let parentPath = getParentPath(path);

  while (parentPath !== undefined && parentPath !== "/") {
    ancestors.unshift(parentPath);
    parentPath = getParentPath(parentPath);
  }

  return ancestors;
}

function getParentPath(path: string): string | undefined {
  if (path === "/") {
    return undefined;
  }

  const parentEnd = path.lastIndexOf("/");
  return parentEnd <= 0 ? "/" : path.slice(0, parentEnd);
}

function requireFileEntry(state: MemoryProviderState, path: string): RemoteStat {
  const entry = state.entries.get(path);

  if (entry === undefined) {
    throw createPathNotFoundError(path, `Memory path not found: ${path}`);
  }

  if (entry.type !== "file") {
    throw createPathNotFoundError(path, `Memory path is not a file: ${path}`);
  }

  return entry;
}

function resolveByteRange(
  size: number,
  range: ProviderTransferReadRequest["range"],
): { offset: number; length: number } {
  if (range === undefined) {
    return { length: size, offset: 0 };
  }

  const requestedOffset = normalizeByteCount(range.offset, "offset");
  const requestedLength =
    range.length === undefined
      ? size - Math.min(requestedOffset, size)
      : normalizeByteCount(range.length, "length");
  const offset = Math.min(requestedOffset, size);
  const length = Math.max(0, Math.min(requestedLength, size - offset));

  return { length, offset };
}

async function collectTransferContent(request: ProviderTransferWriteRequest): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  for await (const chunk of request.content) {
    request.throwIfAborted();
    const clonedChunk = new Uint8Array(chunk);
    chunks.push(clonedChunk);
    byteLength += clonedChunk.byteLength;
    request.reportProgress(byteLength, request.totalBytes);
  }

  return concatChunks(chunks, byteLength);
}

function concatChunks(chunks: Uint8Array[], byteLength: number): Uint8Array {
  const content = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return content;
}

function mergeContentAtOffset(
  previousContent: Uint8Array,
  writtenContent: Uint8Array,
  offset: number,
): Uint8Array {
  const content = new Uint8Array(
    Math.max(previousContent.byteLength, offset + writtenContent.byteLength),
  );
  content.set(previousContent);
  content.set(writtenContent, offset);
  return content;
}

async function* createMemoryContentSource(content: Uint8Array): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  yield new Uint8Array(content);
}

function normalizeOptionalByteCount(value: number | undefined, field: string): number | undefined {
  return value === undefined ? undefined : normalizeByteCount(value, field);
}

function normalizeByteCount(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw createInvalidFixtureError("/", `Memory provider ${field} must be a non-negative number`);
  }

  return Math.floor(value);
}

function cloneVerification(verification: TransferVerificationResult): TransferVerificationResult {
  const clone: TransferVerificationResult = { verified: verification.verified };

  if (verification.method !== undefined) clone.method = verification.method;
  if (verification.checksum !== undefined) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== undefined) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== undefined) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== undefined) clone.details = { ...verification.details };

  return clone;
}

function cloneRemoteEntry(entry: RemoteEntry): RemoteEntry {
  const clone: RemoteEntry = {
    name: entry.name,
    path: entry.path,
    type: entry.type,
  };

  copyOptionalEntryFields(clone, entry);
  return clone;
}

function cloneRemoteStat(entry: RemoteStat): RemoteStat {
  return {
    ...cloneRemoteEntry(entry),
    exists: true,
  };
}

function copyOptionalEntryFields(target: RemoteEntry, source: Partial<RemoteEntry>): void {
  if (source.size !== undefined) target.size = source.size;
  if (source.modifiedAt !== undefined) target.modifiedAt = cloneDate(source.modifiedAt);
  if (source.createdAt !== undefined) target.createdAt = cloneDate(source.createdAt);
  if (source.accessedAt !== undefined) target.accessedAt = cloneDate(source.accessedAt);
  if (source.permissions !== undefined) target.permissions = clonePermissions(source.permissions);
  if (source.owner !== undefined) target.owner = source.owner;
  if (source.group !== undefined) target.group = source.group;
  if (source.symlinkTarget !== undefined) target.symlinkTarget = source.symlinkTarget;
  if (source.uniqueId !== undefined) target.uniqueId = source.uniqueId;
  if (source.raw !== undefined) target.raw = source.raw;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function clonePermissions(permissions: RemotePermissions): RemotePermissions {
  return { ...permissions };
}

function compareEntries(left: RemoteEntry, right: RemoteEntry): number {
  return left.path.localeCompare(right.path);
}

function createPathNotFoundError(path: string, message: string): PathNotFoundError {
  return new PathNotFoundError({
    details: { provider: MEMORY_PROVIDER_ID },
    message,
    path,
    retryable: false,
  });
}

function createInvalidFixtureError(path: string, message: string): ConfigurationError {
  return new ConfigurationError({
    details: { provider: MEMORY_PROVIDER_ID },
    message,
    path,
    retryable: false,
  });
}
