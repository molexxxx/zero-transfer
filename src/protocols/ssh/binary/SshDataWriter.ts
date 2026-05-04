import { Buffer } from "node:buffer";
import { ConfigurationError } from "../../../errors/ZeroTransferError";

const MAX_UINT32 = 0xffff_ffff;
const MAX_UINT64 = (1n << 64n) - 1n;

/**
 * Minimal SSH primitive encoder for transport and authentication packets.
 */
export class SshDataWriter {
  private readonly chunks: Buffer[] = [];
  private length = 0;

  writeByte(value: number): this {
    this.assertByte(value, "byte");
    const chunk = Buffer.allocUnsafe(1);
    chunk.writeUInt8(value, 0);
    return this.push(chunk);
  }

  writeBoolean(value: boolean): this {
    return this.writeByte(value ? 1 : 0);
  }

  writeBytes(value: Uint8Array): this {
    return this.push(Buffer.from(value));
  }

  writeUint32(value: number): this {
    if (!Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
      throw new ConfigurationError({
        details: { value },
        message: "SSH uint32 values must be integers in the range 0..2^32-1",
        retryable: false,
      });
    }

    const chunk = Buffer.allocUnsafe(4);
    chunk.writeUInt32BE(value, 0);
    return this.push(chunk);
  }

  writeUint64(value: bigint): this {
    if (value < 0n || value > MAX_UINT64) {
      throw new ConfigurationError({
        details: { value: value.toString() },
        message: "SSH uint64 values must be in the range 0..2^64-1",
        retryable: false,
      });
    }

    const chunk = Buffer.allocUnsafe(8);
    chunk.writeBigUInt64BE(value, 0);
    return this.push(chunk);
  }

  writeString(value: string | Uint8Array, encoding: BufferEncoding = "utf8"): this {
    const payload = typeof value === "string" ? Buffer.from(value, encoding) : Buffer.from(value);
    this.writeUint32(payload.length);
    return this.push(payload);
  }

  writeMpint(value: Uint8Array): this {
    const normalized = normalizePositiveMpint(value);
    this.writeUint32(normalized.length);
    return this.push(normalized);
  }

  writeNameList(values: readonly string[]): this {
    for (const name of values) {
      if (name.includes(",")) {
        throw new ConfigurationError({
          details: { name },
          message: "SSH name-list entries cannot contain commas",
          retryable: false,
        });
      }
    }

    return this.writeString(values.join(","), "ascii");
  }

  toBuffer(): Buffer {
    return Buffer.concat(this.chunks, this.length);
  }

  private push(chunk: Buffer): this {
    this.chunks.push(chunk);
    this.length += chunk.length;
    return this;
  }

  private assertByte(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xff) {
      throw new ConfigurationError({
        details: { value },
        message: `SSH ${label} values must be integers in the range 0..255`,
        retryable: false,
      });
    }
  }
}

function normalizePositiveMpint(value: Uint8Array): Buffer {
  const input = Buffer.from(value);

  let offset = 0;
  while (offset < input.length && input[offset] === 0x00) {
    offset += 1;
  }

  if (offset >= input.length) {
    return Buffer.alloc(0);
  }

  const stripped = input.subarray(offset);
  if ((stripped[0]! & 0x80) === 0x80) {
    return Buffer.concat([Buffer.from([0x00]), stripped]);
  }

  return stripped;
}
