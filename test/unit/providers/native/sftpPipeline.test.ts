import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import type { SftpSession } from "../../../../src/protocols/sftp/v3/SftpSession";
import {
  SFTP_PIPELINE_DEFAULT_CHUNK_BYTES,
  SFTP_PIPELINE_DEFAULT_MAX_IN_FLIGHT,
  SFTP_PIPELINE_MAX_CHUNK_BYTES,
  pipelinedSftpRead,
  pipelinedSftpWrite,
  resolveSftpPipelineOptions,
} from "../../../../src/providers/native/sftp/sftpPipeline";

const handle = Uint8Array.from([1]);

interface FakeReadOptions {
  /** File content served by the fake. */
  content: Buffer;
  /** Caps each response at this many bytes to simulate short reads. */
  maxResponseBytes?: number;
  /** Per-request artificial latency, keyed by request index (issue order). */
  delayMs?: (requestIndex: number) => number;
  /** Rejects the read covering this offset. */
  failAtOffset?: number;
}

interface FakeSftp {
  session: SftpSession;
  maxObservedInFlight: () => number;
  readCount: () => number;
  writes: Array<{ offset: number; bytes: Buffer }>;
  settleWrites: (failOffsets?: number[]) => void;
}

function createFakeSftp(options: FakeReadOptions): FakeSftp {
  let inFlight = 0;
  let maxInFlight = 0;
  let requestIndex = 0;
  const writes: Array<{ offset: number; bytes: Buffer }> = [];
  const pendingWrites: Array<{ offset: number; resolve: () => void; reject: (e: Error) => void }> =
    [];

  const session = {
    read: async (_handle: Uint8Array, offset: bigint, length: number): Promise<Buffer | null> => {
      const index = requestIndex;
      requestIndex += 1;
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      const delay = options.delayMs?.(index) ?? 0;
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      inFlight -= 1;

      const start = Number(offset);
      if (options.failAtOffset !== undefined && start === options.failAtOffset) {
        throw new Error(`read failed at ${String(start)}`);
      }
      if (start >= options.content.length) return null;
      const capped = Math.min(length, options.maxResponseBytes ?? length);
      const end = Math.min(start + capped, options.content.length);
      return options.content.subarray(start, end);
    },
    write: (_handle: Uint8Array, offset: bigint, data: Uint8Array): Promise<void> => {
      const entry = { bytes: Buffer.from(data), offset: Number(offset) };
      writes.push(entry);
      return new Promise<void>((resolve, reject) => {
        pendingWrites.push({ offset: entry.offset, reject, resolve });
      });
    },
  } as unknown as SftpSession;

  return {
    maxObservedInFlight: () => maxInFlight,
    readCount: () => requestIndex,
    session,
    settleWrites: (failOffsets = []) => {
      for (const pending of pendingWrites.splice(0)) {
        if (failOffsets.includes(pending.offset)) {
          pending.reject(new Error(`write failed at ${String(pending.offset)}`));
        } else {
          pending.resolve();
        }
      }
    },
    writes,
  };
}

function patternBuffer(length: number): Buffer {
  const buffer = Buffer.alloc(length);
  for (let index = 0; index < length; index += 1) buffer[index] = index % 251;
  return buffer;
}

async function collect(source: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of source) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

describe("resolveSftpPipelineOptions", () => {
  it("applies OpenSSH-style defaults", () => {
    expect(resolveSftpPipelineOptions(undefined)).toEqual({
      chunkBytes: SFTP_PIPELINE_DEFAULT_CHUNK_BYTES,
      maxInFlight: SFTP_PIPELINE_DEFAULT_MAX_IN_FLIGHT,
    });
  });

  it("clamps chunkBytes to the packet-safe maximum and rejects junk", () => {
    expect(resolveSftpPipelineOptions({ chunkBytes: 10 * 1024 * 1024 }).chunkBytes).toBe(
      SFTP_PIPELINE_MAX_CHUNK_BYTES,
    );
    expect(resolveSftpPipelineOptions({ chunkBytes: -5, maxInFlight: 0 })).toEqual({
      chunkBytes: SFTP_PIPELINE_DEFAULT_CHUNK_BYTES,
      maxInFlight: SFTP_PIPELINE_DEFAULT_MAX_IN_FLIGHT,
    });
  });
});

describe("pipelinedSftpRead", () => {
  it("delivers bytes identical to the source in offset order", async () => {
    const content = patternBuffer(10_000);
    // A small delay keeps requests pending long enough to observe overlap.
    const fake = createFakeSftp({ content, delayMs: () => 1 });

    const result = await collect(
      pipelinedSftpRead({
        handle,
        length: content.length,
        offset: 0,
        pipeline: { chunkBytes: 1024, maxInFlight: 8 },
        sftp: fake.session,
      }),
    );

    expect(result.equals(content)).toBe(true);
    expect(fake.maxObservedInFlight()).toBeLessThanOrEqual(8);
    expect(fake.maxObservedInFlight()).toBeGreaterThan(1);
  });

  it("emits in offset order even when later requests finish first", async () => {
    const content = patternBuffer(4_096);
    // First request is the slowest; replies arrive in reverse order.
    const fake = createFakeSftp({ content, delayMs: (index) => (4 - index) * 5 });

    const result = await collect(
      pipelinedSftpRead({
        handle,
        length: content.length,
        offset: 0,
        pipeline: { chunkBytes: 1024, maxInFlight: 4 },
        sftp: fake.session,
      }),
    );

    expect(result.equals(content)).toBe(true);
  });

  it("accumulates short reads so every slot is filled", async () => {
    const content = patternBuffer(8_192);
    // The server returns at most 100 bytes per response.
    const fake = createFakeSftp({ content, maxResponseBytes: 100 });

    const result = await collect(
      pipelinedSftpRead({
        handle,
        length: content.length,
        offset: 0,
        pipeline: { chunkBytes: 2048, maxInFlight: 2 },
        sftp: fake.session,
      }),
    );

    expect(result.equals(content)).toBe(true);
  });

  it("honors the read range offset", async () => {
    const content = patternBuffer(2_000);
    const fake = createFakeSftp({ content });

    const result = await collect(
      pipelinedSftpRead({
        handle,
        length: 500,
        offset: 1_000,
        pipeline: { chunkBytes: 128, maxInFlight: 4 },
        sftp: fake.session,
      }),
    );

    expect(result.equals(content.subarray(1_000, 1_500))).toBe(true);
  });

  it("stops cleanly when the file is shorter than expected", async () => {
    const content = patternBuffer(1_500);
    const fake = createFakeSftp({ content });

    const result = await collect(
      pipelinedSftpRead({
        handle,
        // Stat said 4 KiB but the file shrank to 1.5 KiB.
        length: 4_096,
        offset: 0,
        pipeline: { chunkBytes: 1024, maxInFlight: 4 },
        sftp: fake.session,
      }),
    );

    expect(result.equals(content)).toBe(true);
  });

  it("propagates read failures and drains outstanding requests", async () => {
    const content = patternBuffer(8_192);
    const fake = createFakeSftp({ content, failAtOffset: 2_048 });

    await expect(
      collect(
        pipelinedSftpRead({
          handle,
          length: content.length,
          offset: 0,
          pipeline: { chunkBytes: 1024, maxInFlight: 4 },
          sftp: fake.session,
        }),
      ),
    ).rejects.toThrow("read failed at 2048");
  });

  it("serial mode issues exactly one request at a time", async () => {
    const content = patternBuffer(4_096);
    const fake = createFakeSftp({ content, delayMs: () => 1 });

    await collect(
      pipelinedSftpRead({
        handle,
        length: content.length,
        offset: 0,
        pipeline: { chunkBytes: 1024, maxInFlight: 1 },
        sftp: fake.session,
      }),
    );

    expect(fake.maxObservedInFlight()).toBe(1);
  });
});

describe("pipelinedSftpWrite", () => {
  async function* chunks(...sizes: number[]): AsyncGenerator<Uint8Array> {
    await Promise.resolve();
    let seed = 0;
    for (const size of sizes) {
      const chunk = Buffer.alloc(size);
      for (let index = 0; index < size; index += 1) chunk[index] = (seed + index) % 251;
      seed += size;
      yield chunk;
    }
  }

  it("re-slices chunks, keeps the window bounded, and reports a contiguous watermark", async () => {
    const fake = createFakeSftp({ content: Buffer.alloc(0) });
    const acks: Array<[number, number]> = [];

    const settleTimer = setInterval(() => {
      fake.settleWrites();
    }, 1);
    let written: number;
    try {
      written = await pipelinedSftpWrite({
        content: chunks(1000, 5000, 24),
        handle,
        onAck: (acked, absolute) => acks.push([acked, absolute]),
        pipeline: { chunkBytes: 1024, maxInFlight: 3 },
        sftp: fake.session,
        startOffset: 100,
      });
    } finally {
      clearInterval(settleTimer);
    }

    expect(written).toBe(6024);
    // Writes start at the resume offset and tile the payload contiguously.
    expect(fake.writes[0]?.offset).toBe(100);
    const totalWritten = fake.writes.reduce((sum, write) => sum + write.bytes.length, 0);
    expect(totalWritten).toBe(6024);
    for (const write of fake.writes) {
      expect(write.bytes.length).toBeLessThanOrEqual(1024);
    }
    // Watermarks are strictly increasing and end at the full payload.
    const ackedValues = acks.map(([acked]) => acked);
    expect([...ackedValues].sort((a, b) => a - b)).toEqual(ackedValues);
    expect(ackedValues[ackedValues.length - 1]).toBe(6024);
    expect(acks[acks.length - 1]?.[1]).toBe(6124);
  });

  it("stops issuing after a failure and rethrows the first error", async () => {
    const fake = createFakeSftp({ content: Buffer.alloc(0) });

    const writePromise = pipelinedSftpWrite({
      content: chunks(4096),
      handle,
      pipeline: { chunkBytes: 1024, maxInFlight: 2 },
      sftp: fake.session,
      startOffset: 0,
    });
    // Fail the second write (offset 1024); the rest succeed.
    const settleTimer = setInterval(() => {
      fake.settleWrites([1024]);
    }, 1);
    try {
      await expect(writePromise).rejects.toThrow("write failed at 1024");
    } finally {
      clearInterval(settleTimer);
    }
  });
});
