/**
 * FTP MLSD and MLST metadata parsers.
 *
 * The helpers in this module convert machine-readable FTP listing facts into the
 * protocol-neutral {@link RemoteEntry} model used by the rest of ZeroTransfer.
 *
 * @module providers/classic/ftp/FtpListParser
 */
import { ParseError } from "../../../errors/ZeroTransferError";
import type { RemoteEntry, RemoteEntryType } from "../../../types/public";
import { joinRemotePath } from "../../../utils/path";

const UNIX_LIST_MONTHS = new Map(
  ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(
    (month, index) => [month, index],
  ),
);

/**
 * Parses an MLSD directory listing into normalized remote entries.
 *
 * @param input - Raw MLSD response body.
 * @param directory - Parent remote directory used to build entry paths.
 * @returns Remote entries excluding the `.` and `..` pseudo entries.
 * @throws {@link ParseError} When any listing line is malformed.
 */
export function parseMlsdList(input: string, directory = "."): RemoteEntry[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => parseMlsdLine(line, directory))
    .filter((entry) => entry.name !== "." && entry.name !== "..");
}

/**
 * Parses a Unix-style FTP `LIST` response into normalized remote entries.
 *
 * This parser covers the common `ls -l` shape returned by classic FTP daemons and
 * is used as a compatibility fallback when a server does not support MLSD.
 *
 * @param input - Raw LIST response body.
 * @param directory - Parent remote directory used to build entry paths.
 * @param now - Reference date used when LIST entries include time but omit year.
 * @returns Remote entries excluding `.` and `..` pseudo entries.
 * @throws {@link ParseError} When any non-summary listing line is malformed.
 */
export function parseUnixList(input: string, directory = ".", now = new Date()): RemoteEntry[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0 && !line.toLowerCase().startsWith("total "))
    .map((line) => parseUnixListLine(line, directory, now))
    .filter((entry) => entry.name !== "." && entry.name !== "..");
}

/**
 * Parses one Unix-style FTP `LIST` line.
 *
 * @param line - Raw listing line in an `ls -l` compatible format.
 * @param directory - Parent remote directory used to build the entry path.
 * @param now - Reference date used when the line omits a year.
 * @returns Normalized remote entry with raw LIST metadata retained.
 * @throws {@link ParseError} When the line is not a supported Unix LIST entry.
 */
export function parseUnixListLine(line: string, directory = ".", now = new Date()): RemoteEntry {
  const match =
    /^(\S{10})\s+\d+\s+(\S+)\s+(\S+)\s+(\d+)\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4}|\d{1,2}:\d{2})\s+(.+)$/.exec(
      line,
    );

  if (match === null) {
    throw new ParseError({
      details: { line },
      message: `Malformed Unix LIST line: ${line}`,
      retryable: false,
    });
  }

  const [, mode = "", owner, group, sizeText, monthText, dayText, yearOrTime, rawName] = match;
  const { name, symlinkTarget } = parseUnixListName(rawName, mode);
  const entry: RemoteEntry = {
    name,
    path: joinRemotePath(directory, name),
    permissions: { raw: mode },
    raw: { line },
    type: mapUnixListType(mode),
  };
  const modifiedAt = parseUnixListTimestamp(monthText, dayText, yearOrTime, now);

  if (owner !== undefined) entry.owner = owner;
  if (group !== undefined) entry.group = group;
  if (sizeText !== undefined) entry.size = Number(sizeText);
  if (modifiedAt !== undefined) entry.modifiedAt = modifiedAt;
  if (symlinkTarget !== undefined) entry.symlinkTarget = symlinkTarget;

  return entry;
}

/**
 * Parses a single MLSD or MLST fact line.
 *
 * @param line - Raw fact line in `fact=value; name` format.
 * @param directory - Parent remote directory used to build the entry path.
 * @returns A normalized remote entry with parsed facts in `raw` metadata.
 * @throws {@link ParseError} When the line does not contain facts and a name.
 */
export function parseMlsdLine(line: string, directory = "."): RemoteEntry {
  const separatorIndex = line.indexOf(" ");

  if (separatorIndex <= 0 || separatorIndex === line.length - 1) {
    throw new ParseError({
      message: `Malformed MLSD line: ${line}`,
      retryable: false,
      details: {
        line,
      },
    });
  }

  const factText = line.slice(0, separatorIndex);
  const name = line.slice(separatorIndex + 1);
  const facts = parseFacts(factText);
  const type = mapMlsdType(facts.get("type"));
  const modifiedAt = parseMlstTimestamp(facts.get("modify"));
  const sizeText = facts.get("size");
  const permissions = facts.get("perm");
  const uniqueId = facts.get("unique");

  const entry: RemoteEntry = {
    name,
    path: joinRemotePath(directory, name),
    raw: {
      facts: Object.fromEntries(facts),
      line,
    },
    type,
  };

  if (sizeText !== undefined) entry.size = Number(sizeText);
  if (modifiedAt !== undefined) entry.modifiedAt = modifiedAt;
  if (permissions !== undefined) entry.permissions = { raw: permissions };
  if (uniqueId !== undefined) entry.uniqueId = uniqueId;

  return entry;
}

/**
 * Parses the UTC timestamp format used by MLST/MLSD `modify` facts.
 *
 * @param input - Timestamp text such as `20260427010203.123`.
 * @returns A UTC Date when the timestamp is valid, otherwise `undefined`.
 */
export function parseMlstTimestamp(input: string | undefined): Date | undefined {
  if (input === undefined) {
    return undefined;
  }

  const timestampMatch = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.(\d{1,3}))?$/.exec(input);

  if (timestampMatch === null) {
    return undefined;
  }

  const [, year, month, day, hour, minute, second, millisecond = "0"] = timestampMatch;
  const normalizedMillisecond = millisecond.padEnd(3, "0");

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(normalizedMillisecond),
    ),
  );
}

/**
 * Parses semicolon-delimited MLST facts into lowercase keys.
 *
 * @param input - Fact text before the entry name.
 * @returns A map of lowercase fact names to fact values.
 */
function parseFacts(input: string): Map<string, string> {
  const facts = new Map<string, string>();

  for (const fact of input.split(";")) {
    if (fact.length === 0) {
      continue;
    }

    const separatorIndex = fact.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    facts.set(fact.slice(0, separatorIndex).toLowerCase(), fact.slice(separatorIndex + 1));
  }

  return facts;
}

/**
 * Maps the MLSD `type` fact to a normalized remote entry kind.
 *
 * @param input - Raw MLSD type fact value.
 * @returns Normalized entry kind.
 */
function mapMlsdType(input: string | undefined): RemoteEntryType {
  switch (input?.toLowerCase()) {
    case "file":
      return "file";
    case "cdir":
    case "dir":
    case "pdir":
      return "directory";
    case "os.unix=slink":
      return "symlink";
    default:
      return "unknown";
  }
}

/**
 * Maps a Unix LIST mode string to a normalized remote entry kind.
 *
 * @param mode - Permission and file-type mode string from a LIST line.
 * @returns Normalized entry kind.
 */
function mapUnixListType(mode: string): RemoteEntryType {
  switch (mode[0]) {
    case "-":
      return "file";
    case "d":
      return "directory";
    case "l":
      return "symlink";
    default:
      return "unknown";
  }
}

/**
 * Parses a Unix LIST timestamp into a UTC date when possible.
 *
 * @param monthText - Three-letter English month name.
 * @param dayText - Day of month text.
 * @param yearOrTime - Four-digit year or `HH:mm` time field.
 * @param now - Reference date used when the year is omitted.
 * @returns UTC date when the timestamp fields are valid, otherwise `undefined`.
 */
function parseUnixListTimestamp(
  monthText: string | undefined,
  dayText: string | undefined,
  yearOrTime: string | undefined,
  now: Date,
): Date | undefined {
  if (monthText === undefined || dayText === undefined || yearOrTime === undefined) {
    return undefined;
  }

  const month = UNIX_LIST_MONTHS.get(monthText.toLowerCase());
  const day = Number(dayText);

  if (month === undefined || !Number.isInteger(day) || day < 1 || day > 31) {
    return undefined;
  }

  if (/^\d{4}$/.test(yearOrTime)) {
    return new Date(Date.UTC(Number(yearOrTime), month, day));
  }

  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(yearOrTime);

  if (timeMatch === null) {
    return undefined;
  }

  const [, hourText, minuteText] = timeMatch;
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (hour > 23 || minute > 59) {
    return undefined;
  }

  return new Date(Date.UTC(now.getUTCFullYear(), month, day, hour, minute));
}

/**
 * Splits a Unix LIST entry name from a symlink target when present.
 *
 * @param rawName - Name field from the LIST line.
 * @param mode - Permission and file-type mode string from the LIST line.
 * @returns Entry name and optional symbolic-link target.
 */
function parseUnixListName(
  rawName: string | undefined,
  mode: string,
): {
  name: string;
  symlinkTarget?: string;
} {
  const name = rawName ?? "";

  if (!mode.startsWith("l")) {
    return { name };
  }

  const separator = " -> ";
  const separatorIndex = name.indexOf(separator);

  if (separatorIndex < 0) {
    return { name };
  }

  return {
    name: name.slice(0, separatorIndex),
    symlinkTarget: name.slice(separatorIndex + separator.length),
  };
}
