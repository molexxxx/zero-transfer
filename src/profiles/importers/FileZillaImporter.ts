/**
 * FileZilla `sitemanager.xml` importer.
 *
 * Walks FileZilla's nested folder/server hierarchy and emits {@link ConnectionProfile} entries
 * for each saved site. The importer ignores cloud providers and other entries it cannot map
 * to a {@link RemoteProtocol}.
 *
 * @module profiles/importers/FileZillaImporter
 */
import { Buffer } from "node:buffer";
import { ConfigurationError } from "../../errors/ZeroTransferError";
import type { ConnectionProfile } from "../../types/public";

/** Imported FileZilla site with the folder hierarchy that contained it. */
export interface FileZillaSite {
  /** Site display name. */
  name: string;
  /** Ordered folder names leading to the site (top-level first). Empty for root sites. */
  folder: readonly string[];
  /** Generated connection profile. */
  profile: ConnectionProfile;
  /** Encoded password value retained from the file, if any. */
  password?: string;
  /** Logon type code preserved from the file (`0`=anonymous, `1`=normal, etc.). */
  logonType?: number;
}

/** Result returned by {@link importFileZillaSites}. */
export interface ImportFileZillaSitesResult {
  /** Sites successfully mapped to a connection profile. */
  sites: readonly FileZillaSite[];
  /** Sites that were skipped because their protocol is not supported. */
  skipped: readonly { name: string; folder: readonly string[]; protocol?: number }[];
}

/**
 * Parses FileZilla `sitemanager.xml` text and returns generated profiles.
 *
 * @param xml - Contents of `sitemanager.xml`.
 * @returns Imported sites and any skipped entries.
 * @throws {@link ConfigurationError} When the XML root cannot be located.
 */
export function importFileZillaSites(xml: string): ImportFileZillaSitesResult {
  const events = tokenizeXml(xml);
  if (events.length === 0) {
    throw new ConfigurationError({
      code: "filezilla_xml_empty",
      message: "FileZilla sitemanager XML is empty.",
      retryable: false,
    });
  }
  const sites: FileZillaSite[] = [];
  const skipped: { name: string; folder: readonly string[]; protocol?: number }[] = [];
  const folderStack: string[] = [];
  const folderNamePending: boolean[] = [];
  let inServer = false;
  let serverFields: Record<string, string> = {};
  let serverPasswordEncoding: string | undefined;
  let activeTag: string | undefined;
  let captureFolderName = false;

  for (const event of events) {
    if (event.kind === "open") {
      if (event.name === "Folder") {
        folderStack.push("");
        folderNamePending.push(true);
        continue;
      }
      if (event.name === "Server") {
        inServer = true;
        serverFields = {};
        serverPasswordEncoding = undefined;
        continue;
      }
      activeTag = event.name;
      if (event.name === "Pass" && inServer) {
        serverPasswordEncoding = event.attributes["encoding"];
      }
      if (event.name === "Name" && !inServer && folderNamePending.length > 0) {
        captureFolderName = true;
      }
      continue;
    }
    if (event.kind === "text") {
      if (captureFolderName) {
        const top = folderStack.length - 1;
        if (top >= 0) folderStack[top] = event.text.trim();
        captureFolderName = false;
        continue;
      }
      if (inServer && activeTag !== undefined) {
        serverFields[activeTag] = (serverFields[activeTag] ?? "") + event.text;
      }
      continue;
    }
    if (event.kind === "close") {
      if (event.name === "Folder") {
        folderStack.pop();
        folderNamePending.pop();
        continue;
      }
      if (event.name === "Server") {
        const folder = folderStack.filter((segment) => segment !== "");
        const result = buildSiteFromFields(serverFields, serverPasswordEncoding);
        if (result.kind === "site") {
          sites.push({ ...result.site, folder });
        } else {
          skipped.push({
            folder,
            name: result.name,
            ...(result.protocol !== undefined ? { protocol: result.protocol } : {}),
          });
        }
        inServer = false;
        serverFields = {};
        serverPasswordEncoding = undefined;
        activeTag = undefined;
        continue;
      }
      if (activeTag === event.name) activeTag = undefined;
    }
  }
  return { sites, skipped };
}

interface BuiltSite {
  kind: "site";
  site: Omit<FileZillaSite, "folder">;
}

interface SkippedSite {
  kind: "skipped";
  name: string;
  protocol?: number;
}

function buildSiteFromFields(
  fields: Record<string, string>,
  passwordEncoding: string | undefined,
): BuiltSite | SkippedSite {
  const name = (fields["Name"] ?? fields["Host"] ?? "Untitled").trim();
  const host = (fields["Host"] ?? "").trim();
  if (host === "") return { kind: "skipped", name };
  const protocolText = fields["Protocol"];
  const protocol = protocolText !== undefined ? Number.parseInt(protocolText.trim(), 10) : 0;
  const mapped = mapFileZillaProtocol(protocol);
  if (mapped === undefined) {
    return Number.isFinite(protocol)
      ? { kind: "skipped", name, protocol }
      : { kind: "skipped", name };
  }
  const profile: ConnectionProfile = { host, provider: mapped.provider };
  if (mapped.secure !== undefined) profile.secure = mapped.secure;
  const portText = fields["Port"];
  if (portText !== undefined) {
    const port = Number.parseInt(portText.trim(), 10);
    if (Number.isFinite(port)) profile.port = port;
  }
  const user = fields["User"]?.trim();
  if (user !== undefined && user !== "") profile.username = { value: user };

  let password: string | undefined;
  const rawPass = fields["Pass"];
  if (rawPass !== undefined && rawPass !== "") {
    if (passwordEncoding === "base64") {
      password = Buffer.from(rawPass, "base64").toString("utf8");
    } else {
      password = rawPass;
    }
    if (password !== undefined && password !== "") profile.password = { value: password };
  }

  const site: Omit<FileZillaSite, "folder"> = { name, profile };
  if (password !== undefined) site.password = password;
  const logonText = fields["Logontype"];
  if (logonText !== undefined) {
    const logonType = Number.parseInt(logonText.trim(), 10);
    if (Number.isFinite(logonType)) site.logonType = logonType;
  }
  return { kind: "site", site };
}

function mapFileZillaProtocol(
  code: number,
): { provider: NonNullable<ConnectionProfile["provider"]>; secure?: boolean } | undefined {
  switch (code) {
    case 0:
      return { provider: "ftp" };
    case 1:
      return { provider: "sftp" };
    case 4:
      return { provider: "ftps", secure: true };
    case 5:
      return { provider: "ftps", secure: true };
    case 6:
      return { provider: "ftp", secure: false };
    default:
      return undefined;
  }
}

interface XmlOpenEvent {
  kind: "open";
  name: string;
  attributes: Record<string, string>;
  selfClosing: boolean;
}
interface XmlCloseEvent {
  kind: "close";
  name: string;
}
interface XmlTextEvent {
  kind: "text";
  text: string;
}
type XmlEvent = XmlOpenEvent | XmlCloseEvent | XmlTextEvent;

function tokenizeXml(xml: string): XmlEvent[] {
  const events: XmlEvent[] = [];
  let index = 0;
  const length = xml.length;
  while (index < length) {
    const lt = xml.indexOf("<", index);
    if (lt === -1) {
      const text = xml.slice(index);
      if (text.trim() !== "") events.push({ kind: "text", text: decodeEntities(text) });
      break;
    }
    if (lt > index) {
      const text = xml.slice(index, lt);
      if (text.trim() !== "") events.push({ kind: "text", text: decodeEntities(text) });
    }
    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt + 4);
      index = end === -1 ? length : end + 3;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt)) {
      const end = xml.indexOf("]]>", lt + 9);
      const cdataEnd = end === -1 ? length : end;
      events.push({ kind: "text", text: xml.slice(lt + 9, cdataEnd) });
      index = end === -1 ? length : end + 3;
      continue;
    }
    if (xml[lt + 1] === "?" || xml[lt + 1] === "!") {
      const gt = xml.indexOf(">", lt + 1);
      index = gt === -1 ? length : gt + 1;
      continue;
    }
    const gt = xml.indexOf(">", lt + 1);
    if (gt === -1) break;
    const tagBody = xml.slice(lt + 1, gt);
    if (tagBody.startsWith("/")) {
      events.push({ kind: "close", name: tagBody.slice(1).trim() });
    } else {
      const selfClosing = tagBody.endsWith("/");
      const body = selfClosing ? tagBody.slice(0, -1) : tagBody;
      const { name, attributes } = parseTagBody(body.trim());
      events.push({ attributes, kind: "open", name, selfClosing });
      if (selfClosing) events.push({ kind: "close", name });
    }
    index = gt + 1;
  }
  return events;
}

function parseTagBody(body: string): { name: string; attributes: Record<string, string> } {
  const match = body.match(/^([A-Za-z_:][\w:.-]*)\s*(.*)$/);
  if (!match) return { attributes: {}, name: body };
  const name = match[1] ?? "";
  const rest = match[2] ?? "";
  const attributes: Record<string, string> = {};
  const attrRegex = /([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRegex.exec(rest)) !== null) {
    const key = attrMatch[1];
    const value = attrMatch[3] ?? attrMatch[4] ?? "";
    if (key !== undefined) attributes[key] = decodeEntities(value);
  }
  return { attributes, name };
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
