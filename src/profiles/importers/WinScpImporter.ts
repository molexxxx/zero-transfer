/**
 * WinSCP `WinSCP.ini` importer.
 *
 * Parses the INI session sections produced by WinSCP and emits {@link ConnectionProfile} entries.
 * Sessions whose `FSProtocol` cannot be mapped to a classic provider are skipped.
 *
 * @module profiles/importers/WinScpImporter
 */
import { ConfigurationError } from "../../errors/ZeroTransferError";
import type { ConnectionProfile } from "../../types/public";

/** Imported WinSCP session entry. */
export interface WinScpSession {
  /** Decoded session name (URL-decoded path under the `Sessions\\` namespace). */
  name: string;
  /** Hierarchical path segments derived from the session name (folders separated by `/`). */
  folder: readonly string[];
  /** Generated connection profile. */
  profile: ConnectionProfile;
  /** Raw FSProtocol code preserved from the file. */
  fsProtocol?: number;
  /** Raw Ftps code preserved from the file (`0`=none, `1`=implicit, `2`/`3`=explicit). */
  ftps?: number;
}

/** Result of {@link importWinScpSessions}. */
export interface ImportWinScpSessionsResult {
  /** Successfully mapped sessions. */
  sessions: readonly WinScpSession[];
  /** Sessions skipped because their protocol is not supported. */
  skipped: readonly { name: string; folder: readonly string[]; fsProtocol?: number }[];
}

/**
 * Parses WinSCP `WinSCP.ini` text and returns generated profiles.
 *
 * @param ini - Contents of the WinSCP configuration file.
 * @returns Imported sessions and any skipped entries.
 * @throws {@link ConfigurationError} When no session sections are found.
 */
export function importWinScpSessions(ini: string): ImportWinScpSessionsResult {
  const sections = parseIni(ini);
  const sessionSections = sections.filter((section) => section.name.startsWith("Sessions\\"));
  if (sessionSections.length === 0) {
    throw new ConfigurationError({
      code: "winscp_ini_no_sessions",
      message: "WinSCP INI does not contain any [Sessions\\...] sections.",
      retryable: false,
    });
  }
  const sessions: WinScpSession[] = [];
  const skipped: { name: string; folder: readonly string[]; fsProtocol?: number }[] = [];
  for (const section of sessionSections) {
    const decodedPath = decodeSessionPath(section.name.slice("Sessions\\".length));
    const segments = decodedPath.split("/").filter((segment) => segment !== "");
    const name = segments[segments.length - 1] ?? decodedPath;
    const folder = segments.slice(0, -1);
    const built = buildSessionProfile(name, section.values);
    if (built.kind === "session") {
      sessions.push({ ...built.session, folder });
    } else {
      skipped.push({
        folder,
        name,
        ...(built.fsProtocol !== undefined ? { fsProtocol: built.fsProtocol } : {}),
      });
    }
  }
  return { sessions, skipped };
}

interface BuiltSession {
  kind: "session";
  session: Omit<WinScpSession, "folder">;
}
interface SkippedSession {
  kind: "skipped";
  fsProtocol?: number;
}

function buildSessionProfile(
  name: string,
  values: Readonly<Record<string, string>>,
): BuiltSession | SkippedSession {
  const host = values["HostName"]?.trim();
  if (host === undefined || host === "") return { kind: "skipped" };
  const fsProtocolText = values["FSProtocol"];
  const fsProtocol = fsProtocolText !== undefined ? Number.parseInt(fsProtocolText, 10) : 1;
  const ftpsText = values["Ftps"];
  const ftps = ftpsText !== undefined ? Number.parseInt(ftpsText, 10) : 0;
  const mapped = mapWinScpProtocol(fsProtocol, ftps);
  if (mapped === undefined) {
    return Number.isFinite(fsProtocol) ? { fsProtocol, kind: "skipped" } : { kind: "skipped" };
  }

  const profile: ConnectionProfile = { host, provider: mapped.provider };
  if (mapped.secure !== undefined) profile.secure = mapped.secure;
  const portText = values["PortNumber"];
  if (portText !== undefined) {
    const port = Number.parseInt(portText, 10);
    if (Number.isFinite(port)) profile.port = port;
  }
  const user = values["UserName"]?.trim();
  if (user !== undefined && user !== "") profile.username = { value: user };

  if (mapped.provider === "sftp") {
    const ssh: NonNullable<ConnectionProfile["ssh"]> = {};
    const keyPath = values["PublicKeyFile"]?.trim();
    if (keyPath !== undefined && keyPath !== "") ssh.privateKey = { path: keyPath };
    if (Object.keys(ssh).length > 0) profile.ssh = ssh;
  }

  const session: Omit<WinScpSession, "folder"> = { name, profile };
  if (Number.isFinite(fsProtocol)) session.fsProtocol = fsProtocol;
  if (Number.isFinite(ftps) && ftps !== 0) session.ftps = ftps;
  return { kind: "session", session };
}

function mapWinScpProtocol(
  fsProtocol: number,
  ftps: number,
): { provider: NonNullable<ConnectionProfile["provider"]>; secure?: boolean } | undefined {
  switch (fsProtocol) {
    case 0:
    case 1:
    case 2:
      return { provider: "sftp" };
    case 5:
      return ftps === 0 ? { provider: "ftp" } : { provider: "ftps", secure: ftps === 1 };
    default:
      return undefined;
  }
}

interface IniSection {
  name: string;
  values: Record<string, string>;
}

function parseIni(text: string): IniSection[] {
  const sections: IniSection[] = [];
  let current: IniSection | undefined;
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/^\s*[#;].*$/, "").trim();
    if (line === "") continue;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch && sectionMatch[1] !== undefined) {
      current = { name: sectionMatch[1], values: {} };
      sections.push(current);
      continue;
    }
    if (current === undefined) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key !== "") current.values[key] = value;
  }
  return sections;
}

function decodeSessionPath(name: string): string {
  // WinSCP encodes special characters in session names (e.g. spaces as %20, backslashes as %5C).
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
