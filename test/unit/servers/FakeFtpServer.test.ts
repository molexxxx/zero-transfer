import { createConnection } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { FakeFtpServer } from "../../servers/FakeFtpServer";

const servers: FakeFtpServer[] = [];

describe("FakeFtpServer", () => {
  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.stop()));
  });

  it("accepts a TCP connection and responds to scripted commands", async () => {
    const server = new FakeFtpServer({
      responder(command) {
        if (command === "USER zero") {
          return "331 Password required\r\n";
        }

        return ["230 Logged in\r\n"];
      },
    });
    servers.push(server);
    const port = await server.start();

    const transcript = await runClientTranscript(port, ["USER zero\r\n", "PASS secret\r\n"]);

    expect(transcript).toContain("220 ZeroFTP fake server ready");
    expect(transcript).toContain("331 Password required");
    expect(transcript).toContain("230 Logged in");
    expect(server.commands).toEqual(["USER zero", "PASS secret"]);
  });
});

async function runClientTranscript(port: number, commands: string[]): Promise<string> {
  return await new Promise((resolve, reject) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    let transcript = "";

    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      transcript += chunk.toString();

      const nextCommand = commands.shift();
      if (nextCommand !== undefined) {
        socket.write(nextCommand);
        return;
      }

      socket.end();
    });
    socket.on("error", reject);
    socket.on("close", () => resolve(transcript));
  });
}
