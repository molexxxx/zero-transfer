/**
 * Unit tests for SftpSession.
 *
 * Uses a mock SshSessionChannel that allows us to inject server responses
 * and inspect outbound frames without a real SSH connection.
 */
import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { PathNotFoundError, ProtocolError } from "../../../../src/errors/ZeroTransferError";
import {
  SFTP_OPEN_FLAG,
  SFTP_PACKET_TYPE,
  SFTP_STATUS,
  SFTP_PROTOCOL_VERSION,
  SftpSession,
} from "../../../../src/protocols/sftp/v3";
import { encodeSftpAttributes } from "../../../../src/protocols/sftp/v3/SftpAttributes";
import { SshDataWriter } from "../../../../src/protocols/ssh/binary/SshDataWriter";

// -- Mock channel --------------------------------------------------------------

/**
 * A minimal mock for SshSessionChannel.
 * Provides a queue of server-side "frames" to return from receiveData()
 * and captures outbound sendData() calls.
 */
class MockChannel {
  /** Frames the "server" will send to the session. */
  private readonly inboundFrames: Buffer[] = [];
  /** All outbound buffers sent by the session. */
  readonly sentBuffers: Buffer[] = [];

  /** Enqueue a pre-framed SFTP packet (4-byte length + type + payload). */
  enqueuePacket(type: number, bodyBuilder: (w: SshDataWriter) => void): void {
    const body = new SshDataWriter();
    bodyBuilder(body);
    const bodyBuf = body.toBuffer();
    const frameBuf = Buffer.allocUnsafe(4 + 1 + bodyBuf.length);
    frameBuf.writeUInt32BE(1 + bodyBuf.length, 0);
    frameBuf.writeUInt8(type, 4);
    bodyBuf.copy(frameBuf, 5);
    this.inboundFrames.push(frameBuf);
  }

  /** Enqueue a STATUS response for a request id. */
  enqueueStatus(requestId: number, statusCode: number, msg = ""): void {
    this.enqueuePacket(SFTP_PACKET_TYPE.STATUS, (w) => {
      w.writeUint32(requestId)
        .writeUint32(statusCode)
        .writeString(Buffer.from(msg))
        .writeString(Buffer.from("en"));
    });
  }

  /** Enqueue a HANDLE response. */
  enqueueHandle(requestId: number, handle: Buffer): void {
    this.enqueuePacket(SFTP_PACKET_TYPE.HANDLE, (w) => {
      w.writeUint32(requestId).writeString(handle);
    });
  }

  /** Enqueue a DATA response. */
  enqueueData(requestId: number, data: Buffer): void {
    this.enqueuePacket(SFTP_PACKET_TYPE.DATA, (w) => {
      w.writeUint32(requestId).writeString(data);
    });
  }

  /** Enqueue a NAME response with one entry. */
  enqueueName(requestId: number, filename: string): void {
    const emptyAttrs = encodeSftpAttributes({});
    this.enqueuePacket(SFTP_PACKET_TYPE.NAME, (w) => {
      w.writeUint32(requestId)
        .writeUint32(1)
        .writeString(Buffer.from(filename))
        .writeString(Buffer.from(""))
        .writeBytes(emptyAttrs);
    });
  }

  /** Enqueue a VERSION response. */
  enqueueVersion(version = SFTP_PROTOCOL_VERSION): void {
    this.enqueuePacket(SFTP_PACKET_TYPE.VERSION, (w) => {
      w.writeUint32(version);
    });
  }

  sendData(data: Buffer): Promise<void> {
    this.sentBuffers.push(Buffer.from(data));
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *receiveData(): AsyncGenerator<Buffer> {
    for (const frame of this.inboundFrames) {
      yield frame;
    }
  }
}

// -- helpers -------------------------------------------------------------------

function makeSession(): { session: SftpSession; channel: MockChannel } {
  const channel = new MockChannel();
  // Cast as any since we only implement the methods SftpSession uses.
  const session = new SftpSession(channel as never);
  return { channel, session };
}

// -- Tests ---------------------------------------------------------------------

describe("SftpSession.init()", () => {
  it("sends SSH_FXP_INIT and parses the VERSION response", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);

    const result = await session.init();
    expect(result.version).toBe(3);
    expect(session.negotiatedVersion).toBe(3);

    // Verify outbound INIT frame
    expect(channel.sentBuffers.length).toBeGreaterThanOrEqual(1);
    const initFrame = channel.sentBuffers[0]!;
    const msgLen = initFrame.readUInt32BE(0);
    expect(initFrame[4]).toBe(SFTP_PACKET_TYPE.INIT);
    expect(initFrame.readUInt32BE(5)).toBe(SFTP_PROTOCOL_VERSION);
    expect(msgLen).toBe(5); // type(1) + version(4)
  });

  it("rejects when the first packet is not VERSION", async () => {
    const { session, channel } = makeSession();
    channel.enqueueStatus(0, SFTP_STATUS.FAILURE);

    await expect(session.init()).rejects.toThrow(ProtocolError);
  });
});

describe("SftpSession.open()", () => {
  it("returns a handle buffer on success", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    const handle = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
    channel.enqueueHandle(1, handle);

    await session.init();
    const got = await session.open("/remote/file.txt", SFTP_OPEN_FLAG.READ);
    expect(got).toEqual(handle);
  });
});

describe("SftpSession.close()", () => {
  it("resolves on STATUS OK", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueStatus(1, SFTP_STATUS.OK);

    await session.init();
    const handle = Buffer.from("handle");
    await expect(session.close(handle)).resolves.toBeUndefined();
  });
});

describe("SftpSession.read()", () => {
  it("returns data buffer on SSH_FXP_DATA response", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    const data = Buffer.from("file content here");
    channel.enqueueData(1, data);

    await session.init();
    const result = await session.read(Buffer.from("h"), 0n, 4096);
    expect(result).toEqual(data);
  });

  it("returns null on EOF status", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueStatus(1, SFTP_STATUS.EOF);

    await session.init();
    const result = await session.read(Buffer.from("h"), 0n, 4096);
    expect(result).toBeNull();
  });

  it("throws on other error statuses", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueStatus(1, SFTP_STATUS.NO_SUCH_FILE);

    await session.init();
    await expect(session.read(Buffer.from("h"), 0n, 512)).rejects.toThrow(PathNotFoundError);
  });
});

describe("SftpSession.write()", () => {
  it("resolves on STATUS OK", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueStatus(1, SFTP_STATUS.OK);

    await session.init();
    await expect(session.write(Buffer.from("h"), 0n, Buffer.from("data"))).resolves.toBeUndefined();
  });
});

describe("SftpSession.readdir()", () => {
  it("returns entries on SSH_FXP_NAME", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueName(1, "/home/bob");

    await session.init();
    const entries = await session.readdir(Buffer.from("d"));
    expect(entries).toHaveLength(1);
    expect(entries[0]?.filename).toBe("/home/bob");
  });

  it("returns empty array on EOF", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueStatus(1, SFTP_STATUS.EOF);

    await session.init();
    const entries = await session.readdir(Buffer.from("d"));
    expect(entries).toEqual([]);
  });
});

describe("SftpSession.realpath()", () => {
  it("returns the resolved path", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);
    channel.enqueueName(1, "/home/bob");

    await session.init();
    const path = await session.realpath("~");
    expect(path).toBe("/home/bob");
  });
});

describe("SftpSession concurrent requests", () => {
  it("dispatches multiple in-flight requests correctly", async () => {
    const { session, channel } = makeSession();
    channel.enqueueVersion(3);

    // Enqueue responses for ids 1, 2, 3 in a different order (2, 3, 1).
    // The session should still correlate them properly.
    channel.enqueueData(2, Buffer.from("chunk-2"));
    channel.enqueueData(3, Buffer.from("chunk-3"));
    channel.enqueueData(1, Buffer.from("chunk-1"));

    await session.init();

    // Fire three reads simultaneously.
    const h = Buffer.from("h");
    const [r1, r2, r3] = await Promise.all([
      session.read(h, 0n, 512),
      session.read(h, 512n, 512),
      session.read(h, 1024n, 512),
    ]);

    expect(r1).toEqual(Buffer.from("chunk-1"));
    expect(r2).toEqual(Buffer.from("chunk-2"));
    expect(r3).toEqual(Buffer.from("chunk-3"));
  });
});
