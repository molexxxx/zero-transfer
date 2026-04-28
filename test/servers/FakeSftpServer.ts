/**
 * Deterministic in-process SFTP server for provider contract tests.
 *
 * The server uses `ssh2`'s real SSH and SFTP protocol machinery while keeping the
 * backing filesystem in memory. It intentionally implements only the request surface
 * needed by current provider contracts: password/private-key authentication, directory listing,
 * metadata reads, transfer reads/writes, and clean close handling.
 *
 * @module test/servers/FakeSftpServer
 */
import { Server as SshServer, utils } from "ssh2";
import { createHash } from "node:crypto";
import type { Attributes, Connection, FileEntry, ParsedKey, SFTPWrapper } from "ssh2";

const DEFAULT_USERNAME = "tester";
const DEFAULT_PASSWORD = "secret";
const DEFAULT_TIMESTAMP = new Date("2026-04-27T01:02:03.000Z");
const DIRECTORY_TYPE_BITS = 0o040000;
const FILE_TYPE_BITS = 0o100000;
const SYMLINK_TYPE_BITS = 0o120000;
const OPEN_MODE = utils.sftp.OPEN_MODE;
const STATUS_CODE = utils.sftp.STATUS_CODE;
const HOST_KEY_PAIR = utils.generateKeyPairSync("ed25519");
const HOST_KEY = HOST_KEY_PAIR.private;
const HOST_PUBLIC_KEY = HOST_KEY_PAIR.public;

/** Entry kind accepted by the fake SFTP filesystem. */
export type FakeSftpEntryType = "directory" | "file" | "symlink" | "unknown";

/** In-memory file-system entry exposed by {@link FakeSftpServer}. */
export interface FakeSftpEntry {
  /** Absolute SFTP path for the entry. */
  path: string;
  /** Entry kind returned through SFTP attributes. */
  type: FakeSftpEntryType;
  /** Entry size in bytes. Defaults to 0 for directories and symlinks. */
  size?: number;
  /** Optional file content. Strings are encoded as UTF-8. */
  content?: string | Uint8Array;
  /** Numeric uid returned through SFTP attributes. Defaults to 1000. */
  uid?: number;
  /** Numeric gid returned through SFTP attributes. Defaults to 1000. */
  gid?: number;
  /** POSIX permission bits without file-type bits. */
  permissions?: number;
  /** Last access timestamp. Defaults to the modified timestamp. */
  accessedAt?: Date;
  /** Last modification timestamp. */
  modifiedAt?: Date;
}

/** Options used to configure a fake SFTP server instance. */
export interface FakeSftpServerOptions {
  /** Accepted username for password authentication. */
  username?: string;
  /** Accepted password for password authentication. */
  password?: string;
  /** Accepted public key for public-key authentication. */
  publicKey?: Buffer | string;
  /** In-memory entries exposed by the SFTP subsystem. */
  entries?: Iterable<FakeSftpEntry>;
  /** Paths that should return SFTP permission-denied for OPENDIR, OPEN, STAT, and LSTAT. */
  deniedPaths?: Iterable<string>;
  /** Reject SFTP subsystem requests after successful SSH authentication. */
  rejectSftp?: boolean;
}

interface FakeSftpNode {
  attrs: Attributes;
  content: Buffer;
  name: string;
  path: string;
  type: FakeSftpEntryType;
}

interface FakeSftpDirectoryHandle {
  kind: "directory";
  path: string;
  sent: boolean;
}

interface FakeSftpFileHandle {
  kind: "file";
  path: string;
}

type FakeSftpHandle = FakeSftpDirectoryHandle | FakeSftpFileHandle;

/** Small SSH/SFTP server for deterministic SFTP provider tests. */
export class FakeSftpServer {
  private readonly entries: Map<string, FakeSftpNode>;
  private readonly password: string;
  private readonly publicKey: ParsedKey | undefined;
  private readonly deniedPaths: Set<string>;
  private readonly requests: string[] = [];
  private readonly rejectSftp: boolean;
  private readonly server: SshServer;
  private readonly sessions = new Set<Connection>();
  private readonly username: string;

  /**
   * Creates a fake SFTP server without binding a port.
   *
   * @param options - Optional credentials and in-memory entries.
   */
  constructor(options: FakeSftpServerOptions = {}) {
    this.username = options.username ?? DEFAULT_USERNAME;
    this.password = options.password ?? DEFAULT_PASSWORD;
    this.publicKey =
      options.publicKey === undefined ? undefined : parseFakeSftpPublicKey(options.publicKey);
    this.entries = createEntryMap(options.entries ?? createDefaultEntries());
    this.deniedPaths = new Set(Array.from(options.deniedPaths ?? [], normalizeFakeSftpPath));
    this.rejectSftp = options.rejectSftp ?? false;
    this.server = new SshServer({ hostKeys: [HOST_KEY] }, (client) => this.handleClient(client));
  }

  /** Starts listening on a random local TCP port. */
  async start(): Promise<number> {
    await new Promise<void>((resolve) => {
      this.server.listen(0, "127.0.0.1", resolve);
    });

    return this.port;
  }

  /** Stops the server and closes active SSH sessions. */
  async stop(): Promise<void> {
    for (const session of this.sessions) {
      session.end();
    }

    if (!this.server.listening) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  /** Gets the currently bound TCP port. */
  get port(): number {
    const address = this.server.address();

    if (address === null || typeof address === "string") {
      throw new Error("Fake SFTP server is not listening on a TCP port");
    }

    return address.port;
  }

  /** Gets protocol requests received by the fake SFTP subsystem. */
  get commands(): readonly string[] {
    return this.requests;
  }

  /** Gets the server host public key in OpenSSH known_hosts key format. */
  get hostPublicKey(): string {
    return HOST_PUBLIC_KEY;
  }

  /** Gets the server host key SHA-256 fingerprint in OpenSSH `SHA256:` form. */
  get hostKeySha256(): string {
    return `SHA256:${hashSshPublicKey(HOST_PUBLIC_KEY)}`;
  }

  /** Reads a file from the fake backing store for assertions. */
  readFile(path: string): Buffer | undefined {
    const node = this.entries.get(normalizeFakeSftpPath(path));

    return node?.type === "file" ? Buffer.from(node.content) : undefined;
  }

  private handleClient(client: Connection): void {
    this.sessions.add(client);
    client
      .on("authentication", (context) => {
        if (
          context.method === "password" &&
          context.username === this.username &&
          context.password === this.password
        ) {
          context.accept();
          return;
        }

        if (
          context.method === "publickey" &&
          context.username === this.username &&
          this.acceptsPublicKey(context)
        ) {
          context.accept();
          return;
        }

        context.reject();
      })
      .on("ready", () => {
        client.on("session", (accept) => {
          const session = accept();
          session.on("sftp", (acceptSftp, rejectSftp) => {
            if (this.rejectSftp) {
              rejectSftp();
              return;
            }

            this.handleSftp(acceptSftp());
          });
        });
      })
      .on("error", () => {
        this.sessions.delete(client);
      })
      .on("close", () => {
        this.sessions.delete(client);
      });
  }

  private acceptsPublicKey(context: {
    blob?: Buffer;
    hashAlgo?: string;
    key: { algo: string; data: Buffer };
    signature?: Buffer;
  }): boolean {
    if (this.publicKey === undefined) {
      return false;
    }

    if (
      context.key.algo !== this.publicKey.type ||
      !context.key.data.equals(this.publicKey.getPublicSSH())
    ) {
      return false;
    }

    if (context.signature === undefined) {
      return true;
    }

    return (
      context.blob !== undefined &&
      this.publicKey.verify(context.blob, context.signature, context.hashAlgo)
    );
  }

  private handleSftp(sftp: SFTPWrapper): void {
    const handles = new Map<number, FakeSftpHandle>();
    let nextHandle = 1;

    sftp
      .on("OPEN", (reqId, path, flags) => {
        const remotePath = normalizeFakeSftpPath(path);
        this.requests.push(`OPEN ${remotePath}`);

        if (this.deniedPaths.has(remotePath)) {
          sftp.status(reqId, STATUS_CODE.PERMISSION_DENIED);
          return;
        }

        const node = this.openFileNode(remotePath, flags);

        if (node === undefined) {
          sftp.status(reqId, STATUS_CODE.NO_SUCH_FILE);
          return;
        }

        const handle = Buffer.alloc(4);
        handle.writeUInt32BE(nextHandle, 0);
        handles.set(nextHandle, { kind: "file", path: remotePath });
        nextHandle += 1;
        sftp.handle(reqId, handle);
      })
      .on("READ", (reqId, handle, offset, length) => {
        const fileHandle = getFileHandle(handles, handle);

        if (fileHandle === undefined) {
          sftp.status(reqId, STATUS_CODE.FAILURE);
          return;
        }

        this.requests.push(`READ ${fileHandle.path} ${offset} ${length}`);
        const node = this.entries.get(fileHandle.path);

        if (node?.type !== "file") {
          sftp.status(reqId, STATUS_CODE.NO_SUCH_FILE);
          return;
        }

        if (offset >= node.content.byteLength) {
          sftp.status(reqId, STATUS_CODE.EOF);
          return;
        }

        sftp.data(reqId, node.content.subarray(offset, offset + length));
      })
      .on("WRITE", (reqId, handle, offset, data) => {
        const fileHandle = getFileHandle(handles, handle);

        if (fileHandle === undefined) {
          sftp.status(reqId, STATUS_CODE.FAILURE);
          return;
        }

        this.requests.push(`WRITE ${fileHandle.path} ${offset} ${data.byteLength}`);
        const node = this.entries.get(fileHandle.path);

        if (node?.type !== "file") {
          sftp.status(reqId, STATUS_CODE.NO_SUCH_FILE);
          return;
        }

        writeNodeContent(node, data, offset);
        sftp.status(reqId, STATUS_CODE.OK);
      })
      .on("FSTAT", (reqId, handle) => {
        const fileHandle = getFileHandle(handles, handle);
        const node = fileHandle === undefined ? undefined : this.entries.get(fileHandle.path);

        if (node === undefined) {
          sftp.status(reqId, STATUS_CODE.FAILURE);
          return;
        }

        sftp.attrs(reqId, cloneAttributes(node.attrs));
      })
      .on("FSETSTAT", (reqId, handle, attrs) => {
        const fileHandle = getFileHandle(handles, handle);
        const node = fileHandle === undefined ? undefined : this.entries.get(fileHandle.path);

        if (fileHandle === undefined || node === undefined) {
          sftp.status(reqId, STATUS_CODE.FAILURE);
          return;
        }

        this.requests.push(`FSETSTAT ${fileHandle.path}`);
        applyAttributes(node, attrs);
        sftp.status(reqId, STATUS_CODE.OK);
      })
      .on("OPENDIR", (reqId, path) => {
        const remotePath = normalizeFakeSftpPath(path);
        this.requests.push(`OPENDIR ${remotePath}`);
        const node = this.entries.get(remotePath);

        if (this.deniedPaths.has(remotePath)) {
          sftp.status(reqId, STATUS_CODE.PERMISSION_DENIED);
          return;
        }

        if (node?.type !== "directory") {
          sftp.status(reqId, STATUS_CODE.NO_SUCH_FILE);
          return;
        }

        const handle = Buffer.alloc(4);
        handle.writeUInt32BE(nextHandle, 0);
        handles.set(nextHandle, { kind: "directory", path: remotePath, sent: false });
        nextHandle += 1;
        sftp.handle(reqId, handle);
      })
      .on("READDIR", (reqId, handle) => {
        const directoryHandle = getDirectoryHandle(handles, handle);

        if (directoryHandle === undefined) {
          sftp.status(reqId, STATUS_CODE.FAILURE);
          return;
        }

        this.requests.push(`READDIR ${directoryHandle.path}`);

        if (directoryHandle.sent) {
          sftp.status(reqId, STATUS_CODE.EOF);
          return;
        }

        directoryHandle.sent = true;
        const directoryNode = this.entries.get(directoryHandle.path);
        const children = [
          nodeToFileEntry(
            directoryNode ?? createNode({ path: directoryHandle.path, type: "directory" }),
            ".",
          ),
          nodeToFileEntry(
            this.entries.get(getParentPath(directoryHandle.path) ?? "/") ??
              createNode({ path: "/", type: "directory" }),
            "..",
          ),
          ...this.listChildren(directoryHandle.path).map((node) => nodeToFileEntry(node)),
        ];

        if (children.length === 0) {
          sftp.status(reqId, STATUS_CODE.EOF);
          return;
        }

        sftp.name(reqId, children);
      })
      .on("CLOSE", (reqId, handle) => {
        handles.delete(readHandleId(handle));
        sftp.status(reqId, STATUS_CODE.OK);
      })
      .on("LSTAT", (reqId, path) => this.sendAttributes(sftp, reqId, path, "LSTAT"))
      .on("STAT", (reqId, path) => this.sendAttributes(sftp, reqId, path, "STAT"))
      .on("REALPATH", (reqId, path) => this.sendRealPath(sftp, reqId, path));
  }

  private sendAttributes(
    sftp: SFTPWrapper,
    reqId: number,
    path: string,
    command: "LSTAT" | "STAT",
  ): void {
    const remotePath = normalizeFakeSftpPath(path);
    this.requests.push(`${command} ${remotePath}`);
    const node = this.entries.get(remotePath);

    if (this.deniedPaths.has(remotePath)) {
      sftp.status(reqId, STATUS_CODE.PERMISSION_DENIED);
      return;
    }

    if (node === undefined) {
      sftp.status(reqId, STATUS_CODE.NO_SUCH_FILE);
      return;
    }

    sftp.attrs(reqId, cloneAttributes(node.attrs));
  }

  private sendRealPath(sftp: SFTPWrapper, reqId: number, path: string): void {
    const remotePath = normalizeFakeSftpPath(path);
    const node = this.entries.get(remotePath) ?? this.entries.get("/");

    this.requests.push(`REALPATH ${remotePath}`);
    sftp.name(reqId, [nodeToFileEntry(node ?? createNode({ path: "/", type: "directory" }))]);
  }

  private listChildren(path: string): FakeSftpNode[] {
    return [...this.entries.values()]
      .filter((entry) => entry.path !== path && getParentPath(entry.path) === path)
      .sort((left, right) => left.path.localeCompare(right.path));
  }

  private openFileNode(path: string, flags: number): FakeSftpNode | undefined {
    const existing = this.entries.get(path);

    if (existing !== undefined) {
      if (existing.type !== "file") {
        return undefined;
      }

      if (hasOpenFlag(flags, OPEN_MODE.TRUNC)) {
        writeNodeContent(existing, Buffer.alloc(0), 0, true);
      }

      return existing;
    }

    if (!hasOpenFlag(flags, OPEN_MODE.CREAT)) {
      return undefined;
    }

    const parent = this.entries.get(getParentPath(path) ?? "/");

    if (parent?.type !== "directory") {
      return undefined;
    }

    const node = createNode({ content: new Uint8Array(0), path, type: "file" });

    this.entries.set(path, node);
    return node;
  }
}

function createDefaultEntries(): FakeSftpEntry[] {
  return [
    { path: "/incoming", type: "directory" },
    {
      content: "id,name\n1,Ada\n",
      modifiedAt: DEFAULT_TIMESTAMP,
      path: "/incoming/report.csv",
      type: "file",
    },
  ];
}

function parseFakeSftpPublicKey(publicKey: Buffer | string): ParsedKey {
  const parsed = utils.parseKey(publicKey);

  if (parsed instanceof Error) {
    throw parsed;
  }

  return parsed;
}

function hashSshPublicKey(publicKey: Buffer | string): string {
  const key = parseFakeSftpPublicKey(publicKey);

  return createHash("sha256").update(key.getPublicSSH()).digest("base64").replace(/=+$/g, "");
}

function createEntryMap(entries: Iterable<FakeSftpEntry>): Map<string, FakeSftpNode> {
  const nodes = new Map<string, FakeSftpNode>([
    ["/", createNode({ path: "/", type: "directory" })],
  ]);

  for (const entry of entries) {
    const node = createNode(entry);
    ensureParentDirectories(nodes, node.path);
    nodes.set(node.path, node);
  }

  return nodes;
}

function ensureParentDirectories(nodes: Map<string, FakeSftpNode>, path: string): void {
  let parent = getParentPath(path);
  const parents: string[] = [];

  while (parent !== undefined && parent !== "/") {
    parents.unshift(parent);
    parent = getParentPath(parent);
  }

  for (const parentPath of parents) {
    if (!nodes.has(parentPath)) {
      nodes.set(parentPath, createNode({ path: parentPath, type: "directory" }));
    }
  }
}

function createNode(entry: FakeSftpEntry): FakeSftpNode {
  const path = normalizeFakeSftpPath(entry.path);
  const content = createNodeContent(entry);

  return {
    attrs: createAttributes(entry, content),
    content,
    name: basenameFakeSftpPath(path),
    path,
    type: entry.type,
  };
}

function createNodeContent(entry: FakeSftpEntry): Buffer {
  if (entry.type !== "file") {
    return Buffer.alloc(0);
  }

  if (entry.content !== undefined) {
    return typeof entry.content === "string"
      ? Buffer.from(entry.content, "utf8")
      : Buffer.from(entry.content);
  }

  return Buffer.alloc(entry.size ?? 0);
}

function createAttributes(entry: FakeSftpEntry, content: Buffer): Attributes {
  const modifiedAt = entry.modifiedAt ?? DEFAULT_TIMESTAMP;
  const accessedAt = entry.accessedAt ?? modifiedAt;

  return {
    atime: toSftpSeconds(accessedAt),
    gid: entry.gid ?? 1000,
    mode: getTypeBits(entry.type) | (entry.permissions ?? getDefaultPermissions(entry.type)),
    mtime: toSftpSeconds(modifiedAt),
    size: entry.type === "file" ? content.byteLength : (entry.size ?? 0),
    uid: entry.uid ?? 1000,
  };
}

function getDirectoryHandle(
  handles: Map<number, FakeSftpHandle>,
  handle: Buffer,
): FakeSftpDirectoryHandle | undefined {
  const entry = handles.get(readHandleId(handle));

  return entry?.kind === "directory" ? entry : undefined;
}

function getFileHandle(
  handles: Map<number, FakeSftpHandle>,
  handle: Buffer,
): FakeSftpFileHandle | undefined {
  const entry = handles.get(readHandleId(handle));

  return entry?.kind === "file" ? entry : undefined;
}

function writeNodeContent(node: FakeSftpNode, data: Buffer, offset: number, replace = false): void {
  const content = replace
    ? Buffer.alloc(data.byteLength)
    : Buffer.alloc(Math.max(node.content.byteLength, offset + data.byteLength));

  if (!replace) {
    node.content.copy(content);
  }

  data.copy(content, offset);
  node.content = content;
  node.attrs.size = content.byteLength;
  node.attrs.mtime = toSftpSeconds(DEFAULT_TIMESTAMP);
}

function applyAttributes(node: FakeSftpNode, attrs: Partial<Attributes>): void {
  if (attrs.mode !== undefined) node.attrs.mode = attrs.mode;
  if (attrs.uid !== undefined) node.attrs.uid = attrs.uid;
  if (attrs.gid !== undefined) node.attrs.gid = attrs.gid;
  if (attrs.atime !== undefined) node.attrs.atime = toSftpAttributeSeconds(attrs.atime);
  if (attrs.mtime !== undefined) node.attrs.mtime = toSftpAttributeSeconds(attrs.mtime);
}

function toSftpAttributeSeconds(value: number | Date): number {
  return value instanceof Date ? toSftpSeconds(value) : value;
}

function hasOpenFlag(flags: number, flag: number): boolean {
  return (flags & flag) === flag;
}

function nodeToFileEntry(node: FakeSftpNode, filename = node.name): FileEntry {
  return {
    attrs: cloneAttributes(node.attrs),
    filename,
    longname: `${formatLongnameMode(node)} 1 ${node.attrs.uid} ${node.attrs.gid} ${node.attrs.size} Apr 27 2026 ${filename}`,
  };
}

function cloneAttributes(attrs: Attributes): Attributes {
  return {
    atime: attrs.atime,
    gid: attrs.gid,
    mode: attrs.mode,
    mtime: attrs.mtime,
    size: attrs.size,
    uid: attrs.uid,
  };
}

function formatLongnameMode(node: FakeSftpNode): string {
  switch (node.type) {
    case "directory":
      return "drwxr-xr-x";
    case "file":
      return "-rw-r--r--";
    case "symlink":
      return "lrwxrwxrwx";
    default:
      return "?---------";
  }
}

function getTypeBits(type: FakeSftpEntryType): number {
  switch (type) {
    case "directory":
      return DIRECTORY_TYPE_BITS;
    case "file":
      return FILE_TYPE_BITS;
    case "symlink":
      return SYMLINK_TYPE_BITS;
    default:
      return 0;
  }
}

function getDefaultPermissions(type: FakeSftpEntryType): number {
  return type === "directory" || type === "symlink" ? 0o755 : 0o644;
}

function readHandleId(handle: Buffer): number {
  return handle.length >= 4 ? handle.readUInt32BE(0) : -1;
}

function toSftpSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function normalizeFakeSftpPath(input: string): string {
  const normalized = input.replace(/\\/g, "/");
  const absolute = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const segments: string[] = [];

  for (const segment of absolute.split("/")) {
    if (segment.length === 0 || segment === ".") {
      continue;
    }

    if (segment === "..") {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function basenameFakeSftpPath(path: string): string {
  if (path === "/") {
    return "/";
  }

  return path.split("/").filter(Boolean).at(-1) ?? path;
}

function getParentPath(path: string): string | undefined {
  if (path === "/") {
    return undefined;
  }

  const segments = path.split("/").filter(Boolean);
  segments.pop();

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}
