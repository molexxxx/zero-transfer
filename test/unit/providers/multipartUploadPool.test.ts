import { describe, expect, it } from "vitest";
import {
  createSequentialPartReader,
  runMultipartUploadPool,
  type MultipartPart,
} from "../../../src/index";

async function* chunks(...sizes: number[]): AsyncGenerator<Uint8Array> {
  await Promise.resolve();
  let seed = 0;
  for (const size of sizes) {
    const chunk = new Uint8Array(size);
    for (let index = 0; index < size; index += 1) chunk[index] = (seed + index) % 251;
    seed += size;
    yield chunk;
  }
}

function flatten(parts: MultipartPart[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.bytes.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part.bytes, offset);
    offset += part.bytes.byteLength;
  }
  return out;
}

function expectedBytes(total: number): Uint8Array {
  const out = new Uint8Array(total);
  for (let index = 0; index < total; index += 1) out[index] = index % 251;
  return out;
}

describe("createSequentialPartReader", () => {
  it("cuts exact part sizes with deterministic numbering regardless of chunk boundaries", async () => {
    const reader = createSequentialPartReader({
      partSizeBytes: 100,
      source: chunks(30, 250, 5, 80),
    });

    const parts: MultipartPart[] = [];
    while (true) {
      const part = await reader.next();
      if (part === undefined) break;
      parts.push(part);
    }

    expect(parts.map((part) => part.partNumber)).toEqual([1, 2, 3, 4]);
    expect(parts.map((part) => part.bytes.byteLength)).toEqual([100, 100, 100, 65]);
    expect(parts.map((part) => [part.byteStart, part.byteEnd])).toEqual([
      [0, 100],
      [100, 200],
      [200, 300],
      [300, 365],
    ]);
    expect(flatten(parts)).toEqual(expectedBytes(365));
  });

  it("re-slots initial chunks ahead of the remaining source", async () => {
    const source = chunks(40, 60);
    const iterator = source[Symbol.asyncIterator]();
    // Simulate a threshold probe that consumed the first chunk.
    const first = await iterator.next();
    if (first.done === true) throw new Error("unexpected end");

    const reader = createSequentialPartReader({
      initialChunks: [first.value],
      partSizeBytes: 50,
      source: { [Symbol.asyncIterator]: () => iterator },
    });

    const parts: MultipartPart[] = [];
    while (true) {
      const part = await reader.next();
      if (part === undefined) break;
      parts.push(part);
    }

    expect(parts.map((part) => part.bytes.byteLength)).toEqual([50, 50]);
    expect(flatten(parts)).toEqual(expectedBytes(100));
  });

  it("starts numbering and offsets at the resume position", async () => {
    const reader = createSequentialPartReader({
      partSizeBytes: 10,
      source: chunks(25),
      startOffset: 300,
      startPartNumber: 31,
    });

    const first = await reader.next();
    expect(first).toMatchObject({ byteEnd: 310, byteStart: 300, partNumber: 31 });
  });

  it("serializes concurrent next() callers", async () => {
    const reader = createSequentialPartReader({ partSizeBytes: 64, source: chunks(64, 64, 64) });
    const [a, b, c, d] = await Promise.all([
      reader.next(),
      reader.next(),
      reader.next(),
      reader.next(),
    ]);

    expect([a?.partNumber, b?.partNumber, c?.partNumber]).toEqual([1, 2, 3]);
    expect(d).toBeUndefined();
  });
});

describe("runMultipartUploadPool", () => {
  it("uploads parts concurrently while commits stay in part order", async () => {
    const reader = createSequentialPartReader({ partSizeBytes: 50, source: chunks(500) });
    const commits: Array<{ partNumber: number; committedBytes: number }> = [];
    let inFlight = 0;
    let maxInFlight = 0;

    const result = await runMultipartUploadPool<string>({
      onCommitted: (part, committedBytes) => {
        commits.push({ committedBytes, partNumber: part.partNumber });
      },
      partConcurrency: 4,
      reader,
      uploadPart: async (part) => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        // Reverse-ish latency: early parts finish last.
        await new Promise((resolve) => setTimeout(resolve, (11 - part.partNumber) * 2));
        inFlight -= 1;
        return `etag-${String(part.partNumber)}`;
      },
    });

    expect(maxInFlight).toBeGreaterThan(1);
    expect(maxInFlight).toBeLessThanOrEqual(4);
    expect(result.bytesUploaded).toBe(500);
    expect(result.parts.map((part) => part.result)).toEqual(
      Array.from({ length: 10 }, (_, index) => `etag-${String(index + 1)}`),
    );
    // Commits fire strictly in part order with monotonic committed bytes.
    expect(commits.map((commit) => commit.partNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(commits.map((commit) => commit.committedBytes)).toEqual([
      50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
    ]);
  });

  it("partConcurrency 1 reproduces sequential behavior", async () => {
    const reader = createSequentialPartReader({ partSizeBytes: 64, source: chunks(200) });
    const order: number[] = [];
    let inFlight = 0;

    await runMultipartUploadPool<number>({
      partConcurrency: 1,
      reader,
      uploadPart: async (part) => {
        inFlight += 1;
        expect(inFlight).toBe(1);
        await new Promise((resolve) => setTimeout(resolve, 1));
        inFlight -= 1;
        order.push(part.partNumber);
        return part.partNumber;
      },
    });

    expect(order).toEqual([1, 2, 3, 4]);
  });

  it("stops on first failure, settles workers, and never commits past the gap", async () => {
    const reader = createSequentialPartReader({ partSizeBytes: 10, source: chunks(100) });
    const commits: number[] = [];

    await expect(
      runMultipartUploadPool<string>({
        onCommitted: (part) => {
          commits.push(part.partNumber);
        },
        partConcurrency: 3,
        reader,
        uploadPart: async (part) => {
          await new Promise((resolve) => setTimeout(resolve, part.partNumber === 2 ? 1 : 5));
          if (part.partNumber === 2) throw new Error("part 2 exploded");
          return "ok";
        },
      }),
    ).rejects.toThrow("part 2 exploded");

    // Part 1 may commit (it precedes the failure); parts beyond the gap never do.
    expect(commits.every((partNumber) => partNumber === 1)).toBe(true);
  });

  it("anchors contiguous commits at firstPartNumber when resuming", async () => {
    const reader = createSequentialPartReader({
      partSizeBytes: 10,
      source: chunks(30),
      startOffset: 50,
      startPartNumber: 6,
    });
    const commits: Array<[number, number]> = [];

    const result = await runMultipartUploadPool<string>({
      firstPartNumber: 6,
      onCommitted: (part, committedBytes) => {
        commits.push([part.partNumber, committedBytes]);
      },
      partConcurrency: 2,
      reader,
      uploadPart: (part) => Promise.resolve(`etag-${String(part.partNumber)}`),
    });

    expect(commits).toEqual([
      [6, 60],
      [7, 70],
      [8, 80],
    ]);
    expect(result.bytesUploaded).toBe(30);
  });
});
