import { Buffer } from "node:buffer";
import { ParseError } from "../../../errors/ZeroTransferError";

/**
 * Stateful SSH primitive decoder that reads sequential values from a packet payload.
 */
export class SshDataReader {
  private offset = 0;

  constructor(private readonly source: Uint8Array) {}

  get remaining(): number {
    return this.source.length - this.offset;
  }

  hasMore(): boolean {
    return this.remaining > 0;
  }

  readByte(): number {
    this.ensureAvailable(1, "byte");
    const value = this.source[this.offset]!;
    this.offset += 1;
    return value;
  }

  readBoolean(): boolean {
    return this.readByte() !== 0;
  }

  readBytes(length: number): Buffer {
    this.ensureAvailable(length, "bytes");
    const data = this.source.subarray(this.offset, this.offset + length);
    this.offset += length;
    return Buffer.from(data);
  }

  readUint32(): number {
    this.ensureAvailable(4, "uint32");
    const buffer = Buffer.from(this.source);
    const value = buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  readUint64(): bigint {
    this.ensureAvailable(8, "uint64");
    const buffer = Buffer.from(this.source);
    const value = buffer.readBigUInt64BE(this.offset);
    this.offset += 8;
    return value;
  }

  readString(): Buffer {
    const length = this.readUint32();
    this.ensureAvailable(length, "string");
    const data = this.source.subarray(this.offset, this.offset + length);
    this.offset += length;
    return Buffer.from(data);
  }

  readUtf8String(): string {
    return this.readString().toString("utf8");
  }

  readNameList(): string[] {
    const value = this.readString().toString("ascii");

    if (value.length === 0) {
      return [];
    }

    return value.split(",").filter((item) => item.length > 0);
  }

  /**
   * Reads an SSH `mpint` value (RFC 4251 §5): a length-prefixed two's-complement
   * big-endian integer. Returns the raw magnitude bytes (non-negative integers
   * may have a leading 0x00 byte preserved by the caller as needed).
   */
  readMpint(): Buffer {
    return this.readString();
  }

  assertFinished(): void {
    if (this.remaining !== 0) {
      throw new ParseError({
        details: { remaining: this.remaining },
        message: "Unexpected trailing SSH packet bytes",
        retryable: false,
      });
    }
  }

  private ensureAvailable(bytes: number, type: string): void {
    if (this.remaining >= bytes) {
      return;
    }

    throw new ParseError({
      details: {
        available: this.remaining,
        needed: bytes,
      },
      message: `Unexpected end of SSH packet while reading ${type}`,
      retryable: false,
    });
  }
}
