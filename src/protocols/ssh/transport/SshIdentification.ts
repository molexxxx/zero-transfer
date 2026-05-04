import { ParseError } from "../../../errors/ZeroTransferError";

const SSH_IDENT_PREFIX = "SSH-";
const SSH_PROTOCOL_VERSION = "2.0";

/** Parsed SSH identification components from the RFC 4253 banner line. */
export interface SshIdentification {
  protocolVersion: string;
  softwareVersion: string;
  comments?: string;
  raw: string;
}

/**
 * Builds an SSH identification line without CRLF terminators.
 */
export function buildSshIdentificationLine(options: {
  softwareVersion: string;
  comments?: string;
  protocolVersion?: string;
}): string {
  const protocolVersion = options.protocolVersion ?? SSH_PROTOCOL_VERSION;

  if (protocolVersion.trim().length === 0 || options.softwareVersion.trim().length === 0) {
    throw new ParseError({
      message: "SSH identification protocol and software versions must be non-empty",
      retryable: false,
    });
  }

  const base = `${SSH_IDENT_PREFIX}${protocolVersion}-${options.softwareVersion}`;
  if (options.comments === undefined || options.comments.length === 0) {
    return base;
  }

  return `${base} ${options.comments}`;
}

/**
 * Parses a single SSH identification line without the trailing CRLF.
 */
export function parseSshIdentificationLine(line: string): SshIdentification {
  if (!line.startsWith(SSH_IDENT_PREFIX)) {
    throw new ParseError({
      details: { line },
      message: "SSH identification line must start with 'SSH-'",
      retryable: false,
    });
  }

  const firstSpace = line.indexOf(" ");
  const header = firstSpace === -1 ? line : line.slice(0, firstSpace);
  const comments = firstSpace === -1 ? undefined : line.slice(firstSpace + 1);
  const headerParts = header.split("-");

  if (headerParts.length < 3) {
    throw new ParseError({
      details: { line },
      message: "SSH identification line is malformed",
      retryable: false,
    });
  }

  const protocolVersion = headerParts[1] ?? "";
  const softwareVersion = headerParts.slice(2).join("-");

  if (protocolVersion.length === 0 || softwareVersion.length === 0) {
    throw new ParseError({
      details: { line },
      message: "SSH identification line must include protocol and software versions",
      retryable: false,
    });
  }

  return {
    protocolVersion,
    softwareVersion,
    raw: line,
    ...(comments === undefined || comments.length === 0 ? {} : { comments }),
  };
}
