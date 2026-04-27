/**
 * FTP MLSD and MLST metadata parsers.
 *
 * The helpers in this module convert machine-readable FTP listing facts into the
 * protocol-neutral {@link RemoteEntry} model used by the rest of ZeroFTP.
 *
 * @module providers/classic/ftp/FtpListParser
 */
import { ParseError } from "../../../errors/ZeroFTPError";
import type { RemoteEntry, RemoteEntryType } from "../../../types/public";
import { joinRemotePath } from "../../../utils/path";

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
