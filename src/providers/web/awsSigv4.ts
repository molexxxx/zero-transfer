/**
 * AWS SigV4 request signer used by the S3-compatible provider.
 *
 * Produces an `Authorization` header (and `x-amz-content-sha256` / `x-amz-date`
 * headers) that conform to AWS Signature Version 4. Only the subset required
 * by the S3 REST API surface is implemented.
 *
 * @module providers/web/awsSigv4
 */
import { createHash, createHmac } from "node:crypto";

/** Inputs for {@link signSigV4}. */
export interface SigV4Input {
  /** HTTP method, upper-case (e.g. `"GET"`, `"PUT"`, `"HEAD"`). */
  method: string;
  /** Fully resolved request URL. */
  url: URL;
  /** Header bag the signer should sign and augment. Mutated in place. */
  headers: Record<string, string>;
  /** AWS region (e.g. `"us-east-1"`). */
  region: string;
  /** AWS service identifier (e.g. `"s3"`). */
  service: string;
  /** AWS access key id. */
  accessKeyId: string;
  /** AWS secret access key. */
  secretAccessKey: string;
  /** Optional STS session token. */
  sessionToken?: string;
  /** Body bytes used to compute the payload hash. Defaults to empty. */
  body?: Uint8Array;
  /** Override SigV4 timestamp; primarily useful in tests. */
  now?: Date;
}

const UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";

/** Signs `input.headers` with SigV4 and returns the canonical string for diagnostics. */
export function signSigV4(input: SigV4Input): { authorization: string; signedHeaders: string } {
  const now = input.now ?? new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash =
    input.body !== undefined ? sha256Hex(input.body) : sha256Hex(new Uint8Array());

  input.headers["host"] = input.url.host;
  input.headers["x-amz-date"] = amzDate;
  input.headers["x-amz-content-sha256"] = payloadHash;
  if (input.sessionToken !== undefined) {
    input.headers["x-amz-security-token"] = input.sessionToken;
  }

  const canonicalUri = canonicalizePath(input.url.pathname);
  const canonicalQuery = canonicalizeQuery(input.url.searchParams);
  const lowerHeaders: Array<[string, string]> = Object.entries(input.headers)
    .map<[string, string]>(([name, value]) => [
      name.toLowerCase(),
      value.trim().replace(/\s+/g, " "),
    ])
    .sort((entryA, entryB) => (entryA[0] < entryB[0] ? -1 : entryA[0] > entryB[0] ? 1 : 0));
  const canonicalHeaders = lowerHeaders.map(([n, v]) => `${n}:${v}\n`).join("");
  const signedHeaders = lowerHeaders.map(([n]) => n).join(";");

  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(Buffer.from(canonicalRequest, "utf8")),
  ].join("\n");

  const kDate = hmac(`AWS4${input.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, input.region);
  const kService = hmac(kRegion, input.service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmacHex(kSigning, stringToSign);

  const authorization = `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  input.headers["authorization"] = authorization;
  return { authorization, signedHeaders };
}

/** Marker payload value used when signing GET-style requests without a body hash. */
export const SIGV4_UNSIGNED_PAYLOAD = UNSIGNED_PAYLOAD;

function formatAmzDate(now: Date): string {
  const iso = now.toISOString();
  return `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}T${iso.slice(11, 13)}${iso.slice(14, 16)}${iso.slice(17, 19)}Z`;
}

function canonicalizePath(pathname: string): string {
  if (pathname.length === 0) return "/";
  return pathname
    .split("/")
    .map((segment) => encodeRfc3986(decodeURIComponent(segment)))
    .join("/");
}

function canonicalizeQuery(params: URLSearchParams): string {
  const entries: Array<[string, string]> = [];
  params.forEach((value, key) => {
    entries.push([key, value]);
  });
  entries.sort(([ka, va], [kb, vb]) => (ka === kb ? (va < vb ? -1 : va > vb ? 1 : 0) : ka < kb ? -1 : 1));
  return entries
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function sha256Hex(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function hmacHex(key: Buffer, data: string): string {
  return createHmac("sha256", key).update(data, "utf8").digest("hex");
}
