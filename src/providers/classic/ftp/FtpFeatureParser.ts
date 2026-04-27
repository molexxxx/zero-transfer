/**
 * FTP FEAT response parser.
 *
 * This module extracts advertised server capabilities and MLST facts from a parsed
 * FTP response, raw response string, or pre-split response lines.
 *
 * @module providers/classic/ftp/FtpFeatureParser
 */
import type { FtpResponse } from "./FtpResponseParser";

/**
 * Normalized server features returned by an FTP FEAT command.
 */
export interface FtpFeatures {
  /** Raw normalized feature lines. */
  raw: string[];
  /** Uppercase feature names for fast lookup. */
  names: Set<string>;
  /** MLST facts advertised by the server, preserving required-fact markers. */
  mlstFacts: string[];
  /**
   * Checks whether a named feature is advertised.
   *
   * @param featureName - Feature name to search for, case-insensitively.
   * @returns `true` when the feature appears in the FEAT response.
   */
  supports(featureName: string): boolean;
}

/**
 * Parses FTP FEAT output into a normalized feature set.
 *
 * @param input - Parsed FTP response, raw string, or individual response lines.
 * @returns Normalized feature names, raw feature lines, and MLST fact names.
 */
export function parseFtpFeatures(input: FtpResponse | string | string[]): FtpFeatures {
  const lines = normalizeFeatureLines(input);
  const raw: string[] = [];
  const names = new Set<string>();
  const mlstFacts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0 || /^\d{3}/.test(trimmed) || trimmed.toLowerCase() === "end") {
      continue;
    }

    raw.push(trimmed);
    const [featureName = ""] = trimmed.split(/\s+/, 1);
    const normalizedName = featureName.toUpperCase();
    names.add(normalizedName);

    if (normalizedName === "MLST") {
      const factText = trimmed.slice(featureName.length).trim();
      mlstFacts.push(
        ...factText
          .split(";")
          .map((fact) => fact.trim())
          .filter(Boolean),
      );
    }
  }

  return {
    raw,
    names,
    mlstFacts,
    supports(featureName: string) {
      return names.has(featureName.toUpperCase());
    },
  };
}

/**
 * Converts supported FEAT inputs into a common line array.
 *
 * @param input - Parsed FTP response, raw string, or line array.
 * @returns Individual response lines ready for feature parsing.
 */
function normalizeFeatureLines(input: FtpResponse | string | string[]): string[] {
  if (typeof input === "string") {
    return input.split(/\r?\n/);
  }

  if (Array.isArray(input)) {
    return input;
  }

  return input.lines;
}
