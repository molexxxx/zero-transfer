/**
 * Deterministic in-process SFTP server for provider contract tests.
 *
 * The server uses `ssh2`'s real SSH and SFTP protocol machinery while keeping the
 * backing filesystem in memory. It intentionally implements only the request surface
 * needed by current provider contracts: password authentication, directory listing,
 * metadata reads, and clean close handling.
 *
 * @module test/servers/FakeSftpServer
 */
import { Server as SshServer, utils } from "ssh2";
import type { Attributes, Connection, FileEntry, SFTPWrapper } from "ssh2";

const DEFAULT_USERNAME = "tester";
const DEFAULT_PASSWORD = "secret";
const DEFAULT_TIMESTAMP = new Date("2026-04-27T01:02:03.000Z");
const DIRECTORY_TYPE_BITS = 0o040000;
const FILE_TYPE_BITS = 0o100000;
const SYMLINK_TYPE_BITS = 0o120000;
const STATUS_CODE = utils.sftp.STATUS_CODE;

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
  /** In-memory entries exposed by the SFTP subsystem. */
  entries?: Iterable<FakeSftpEntry>;
  /** Paths that should return SFTP permission-denied for OPENDIR, STAT, and LSTAT. */
  deniedPaths?: Iterable<string>;
  /** Reject SFTP subsystem requests after successful SSH authentication. */
  rejectSftp?: boolean;
}

interface FakeSftpNode {
  attrs: Attributes;
  name: string;
  path: string;
  type: FakeSftpEntryType;
}

interface FakeSftpDirectoryHandle {
  path: string;
  sent: boolean;
}

/** Small SSH/SFTP server for deterministic SFTP provider tests. */
export class FakeSftpServer {
  private readonly entries: Map<string, FakeSftpNode>;
  private readonly password: string;
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
    this.entries = createEntryMap(options.entries ?? createDefaultEntries());
    this.deniedPaths = new Set(Array.from(options.deniedPaths ?? [], normalizeFakeSftpPath));
    this.rejectSftp = options.rejectSftp ?? false;
    this.server = new SshServer(
      { hostKeys: [utils.generateKeyPairSync("ed25519").private] },
      (client) => this.handleClient(client),
    );
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
      .on("close", () => {
        this.sessions.delete(client);
      });
  }

  private handleSftp(sftp: SFTPWrapper): void {
    const handles = new Map<number, FakeSftpDirectoryHandle>();
    let nextHandle = 1;

    sftp
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
        handles.set(nextHandle, { path: remotePath, sent: false });
        nextHandle += 1;
        sftp.handle(reqId, handle);
      })
      .on("READDIR", (reqId, handle) => {
        const directoryHandle = handles.get(readHandleId(handle));

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
}

function createDefaultEntries(): FakeSftpEntry[] {
  return [
    { path: "/incoming", type: "directory" },
    {
      modifiedAt: DEFAULT_TIMESTAMP,
      path: "/incoming/report.csv",
      size: 14,
      type: "file",
    },
  ];
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

  return {
    attrs: createAttributes(entry),
    name: basenameFakeSftpPath(path),
    path,
    type: entry.type,
  };
}

function createAttributes(entry: FakeSftpEntry): Attributes {
  const modifiedAt = entry.modifiedAt ?? DEFAULT_TIMESTAMP;
  const accessedAt = entry.accessedAt ?? modifiedAt;

  return {
    atime: toSftpSeconds(accessedAt),
    gid: entry.gid ?? 1000,
    mode: getTypeBits(entry.type) | (entry.permissions ?? getDefaultPermissions(entry.type)),
    mtime: toSftpSeconds(modifiedAt),
    size: entry.size ?? 0,
    uid: entry.uid ?? 1000,
  };
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
