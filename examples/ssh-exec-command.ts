/**
 * @file SSH remote command execution via the standalone `@zero-transfer/ssh` stack.
 *
 * The `@zero-transfer/ssh` scope exposes the same RFC 4253 / 4252 / 4254 stack
 * that powers `@zero-transfer/sftp`, but lets you drive the connection
 * protocol layer directly — useful for `exec` channels, custom subsystems,
 * and other non-file-transfer SSH features.
 *
 * This example connects to an SSH server, authenticates with a password,
 * runs a single command on an `exec` channel, and prints its stdout.
 *
 * For file transfer flows (upload / download / sync), use `@zero-transfer/sftp`
 * directly — see `sftp-basic.ts` and `sftp-private-key.ts`.
 */
import { fileURLToPath } from "node:url";
import { connect } from "node:net";
import { SshAuthSession, SshConnectionManager, SshTransportConnection } from "@zero-transfer/ssh";

async function main(): Promise<void> {
  const host = "ssh.example.com";
  const port = 22;
  const username = "deploy";
  const password = process.env.SSH_PASSWORD ?? "";
  const command = "uname -a";

  // 1. Open a TCP socket. The SSH stack does not own networking — bring your own.
  const socket = connect({ host, port });
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });

  const transport = new SshTransportConnection({
    handshakeTimeoutMs: 10_000,
    // Strongly recommended in production: pin the host key here. The hook
    // receives the server's host-key blob + SHA-256 digest before auth runs.
    // verifyHostKey: ({ hostKeySha256 }) => {
    //   if (hostKeySha256.toString("base64") !== "expected-base64-digest=") {
    //     throw new Error("host key mismatch");
    //   }
    // },
  });

  try {
    // 2. Run identification exchange + key exchange. Returns the session id
    //    that user-auth needs to bind its signatures to this transport.
    const handshake = await transport.connect(socket);

    // 3. Authenticate. `@zero-transfer/ssh` supports password,
    //    keyboard-interactive, and Ed25519 / RSA-SHA2 publickey credentials.
    const auth = new SshAuthSession(transport);
    await auth.authenticate({
      credential: { type: "password", username, password },
      sessionId: handshake.keyExchange.sessionId,
    });

    // 4. Open the connection-protocol layer and run a command.
    const conn = new SshConnectionManager(transport);
    const channel = await conn.openExecChannel(command);

    // Drive the dispatch pump in the background. It resolves on clean close
    // and rejects on transport error.
    const pump = conn.start();
    pump.catch(() => {
      // Errors surface via channel.receiveData() below; ignore here.
    });

    // 5. Drain stdout from the channel.
    let output = "";
    for await (const chunk of channel.receiveData()) {
      output += chunk.toString("utf8");
    }
    process.stdout.write(output);

    channel.close();
  } finally {
    transport.disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
