/**
 * FTP control-channel response parser.
 *
 * The parser accepts arbitrary chunks from a socket and produces complete FTP
 * responses, including multi-line replies defined by RFC 959.
 *
 * @module providers/classic/ftp/FtpResponseParser
 */
import { ParseError } from "../../../errors/ZeroTransferError";

/** FTP response status family derived from the first digit of the reply code. */
export type FtpResponseStatus =
  | "preliminary"
  | "completion"
  | "intermediate"
  | "transientFailure"
  | "permanentFailure";

/**
 * Complete parsed FTP response.
 */
export interface FtpResponse {
  /** Numeric three-digit FTP reply code. */
  code: number;
  /** Response message with multi-line content joined by newlines. */
  message: string;
  /** Individual message lines without the reply-code prefix. */
  lines: string[];
  /** Raw response lines joined by newlines. */
  raw: string;
  /** Classified response status family. */
  status: FtpResponseStatus;
  /** Whether the response is a 1xx preliminary reply. */
  preliminary: boolean;
  /** Whether the response is a 2xx completion reply. */
  completion: boolean;
  /** Whether the response is a 3xx intermediate reply. */
  intermediate: boolean;
  /** Whether the response is a 4xx transient failure reply. */
  transientFailure: boolean;
  /** Whether the response is a 5xx permanent failure reply. */
  permanentFailure: boolean;
}

/** Internal accumulator for an incomplete multi-line FTP response. */
interface PendingResponse {
  code: number;
  lines: string[];
  rawLines: string[];
}

const FTP_LINE_PATTERN = /^(\d{3})([ -])(.*)$/;

/**
 * Stateful parser for socket-delivered FTP response text.
 */
export class FtpResponseParser {
  private buffer = "";
  private pendingResponse: PendingResponse | undefined;

  /**
   * Adds incoming socket data and returns any complete responses.
   *
   * @param chunk - Buffer or string chunk from the FTP control connection.
   * @returns Zero or more complete parsed responses.
   * @throws {@link ParseError} When a malformed standalone response line is received.
   */
  push(chunk: Buffer | string): FtpResponse[] {
    this.buffer += chunk.toString();
    const rawLines = this.buffer.split(/\r?\n/);
    this.buffer = rawLines.pop() ?? "";

    const responses: FtpResponse[] = [];

    for (const rawLine of rawLines) {
      const response = this.consumeLine(rawLine);

      if (response !== undefined) {
        responses.push(response);
      }
    }

    return responses;
  }

  /**
   * Clears buffered text and any incomplete multi-line response state.
   *
   * @returns Nothing.
   */
  reset(): void {
    this.buffer = "";
    this.pendingResponse = undefined;
  }

  /**
   * Checks whether the parser is holding buffered or incomplete response data.
   *
   * @returns `true` when there is unconsumed text or an open multi-line response.
   */
  hasPendingResponse(): boolean {
    return this.pendingResponse !== undefined || this.buffer.length > 0;
  }

  /**
   * Consumes one line of FTP response text.
   *
   * @param rawLine - Line without a trailing CRLF delimiter.
   * @returns A complete response when the line finishes one, otherwise `undefined`.
   * @throws {@link ParseError} When a malformed standalone line is encountered.
   */
  private consumeLine(rawLine: string): FtpResponse | undefined {
    const lineMatch = FTP_LINE_PATTERN.exec(rawLine);

    if (lineMatch === null) {
      if (this.pendingResponse !== undefined) {
        this.pendingResponse.lines.push(rawLine);
        this.pendingResponse.rawLines.push(rawLine);
        return undefined;
      }

      if (rawLine.length === 0) {
        return undefined;
      }

      throw new ParseError({
        message: `Malformed FTP response line: ${rawLine}`,
        retryable: false,
        details: {
          rawLine,
        },
      });
    }

    const code = Number(lineMatch[1]!);
    const separator = lineMatch[2]!;
    const message = lineMatch[3]!;

    if (this.pendingResponse !== undefined) {
      this.pendingResponse.lines.push(messageFromRawLine(rawLine, this.pendingResponse.code));
      this.pendingResponse.rawLines.push(rawLine);

      if (code === this.pendingResponse.code && separator === " ") {
        const completed = this.pendingResponse;
        this.pendingResponse = undefined;
        return buildResponse(completed.code, completed.lines, completed.rawLines);
      }

      return undefined;
    }

    if (separator === "-") {
      this.pendingResponse = {
        code,
        lines: [message],
        rawLines: [rawLine],
      };
      return undefined;
    }

    return buildResponse(code, [message], [rawLine]);
  }
}

/**
 * Parses an exact set of response lines into one complete FTP response.
 *
 * @param lines - Raw response lines without trailing newline delimiters.
 * @returns A single complete parsed FTP response.
 * @throws {@link ParseError} When the lines do not contain exactly one complete response.
 */
export function parseFtpResponseLines(lines: string[]): FtpResponse {
  const parser = new FtpResponseParser();
  const responses = parser.push(`${lines.join("\r\n")}\r\n`);

  if (responses.length !== 1 || parser.hasPendingResponse()) {
    throw new ParseError({
      message: "Expected exactly one complete FTP response",
      retryable: false,
      details: {
        responseCount: responses.length,
      },
    });
  }

  return responses[0]!;
}

/**
 * Builds a normalized response object from parsed message and raw lines.
 *
 * @param code - FTP status code shared by the response lines.
 * @param lines - Message lines without status prefixes.
 * @param rawLines - Original raw response lines.
 * @returns A normalized response with status-family booleans.
 */
function buildResponse(code: number, lines: string[], rawLines: string[]): FtpResponse {
  const status = classifyStatus(code);

  return {
    code,
    message: lines.join("\n"),
    lines,
    raw: rawLines.join("\n"),
    status,
    preliminary: status === "preliminary",
    completion: status === "completion",
    intermediate: status === "intermediate",
    transientFailure: status === "transientFailure",
    permanentFailure: status === "permanentFailure",
  };
}

/**
 * Classifies an FTP status code into its response family.
 *
 * @param code - Numeric FTP reply code.
 * @returns The matching response status family.
 */
function classifyStatus(code: number): FtpResponseStatus {
  if (code >= 100 && code < 200) return "preliminary";
  if (code >= 200 && code < 300) return "completion";
  if (code >= 300 && code < 400) return "intermediate";
  if (code >= 400 && code < 500) return "transientFailure";
  return "permanentFailure";
}

/**
 * Removes a matching FTP reply prefix from a raw response line.
 *
 * @param rawLine - Original response line.
 * @param code - Expected multi-line response code.
 * @returns Message text without the FTP prefix when present.
 */
function messageFromRawLine(rawLine: string, code: number): string {
  const codeText = String(code);

  if (rawLine.startsWith(`${codeText} `) || rawLine.startsWith(`${codeText}-`)) {
    return rawLine.slice(4);
  }

  return rawLine;
}
