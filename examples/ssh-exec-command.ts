/**
 * @file SSH remote command execution via the standalone `@zero-transfer/ssh` stack.
 *
 * The `@zero-transfer/ssh` scope exposes the same RFC 4253 / 4252 / 4254 stack
 * that powers `@zero-transfer/sftp`, but lets you drive the connection
 * protocol layer directly - useful for `exec` channels, custom subsystems,
 * and other non-file-transfer SSH features.
 *
 * This example uses the high-level `runSshCommand` helper, which owns the
 * TCP socket, transport handshake, authentication, channel lifecycle, and
 * stdout capture for the common one-shot exec case. For multi-channel work,
 * custom subsystems, or fine-grained control, drop down to
 * `SshTransportConnection` + `SshAuthSession` + `SshConnectionManager`
 * directly.
 *
 * For file transfer flows (upload / download / sync), use `@zero-transfer/sftp`
 * directly - see `sftp-basic.ts` and `sftp-private-key.ts`.
 */
import { runSshCommand } from "@zero-transfer/ssh";

const { stdoutText } = await runSshCommand({
  host: "ssh.example.com",
  auth: {
    type: "password",
    username: "deploy",
    password: process.env.SSH_PASSWORD ?? "",
  },
  command: "uname -a",
  // Strongly recommended in production: pin the host key here.
  // transport: {
  //   verifyHostKey: ({ hostKeySha256 }) => {
  //     if (hostKeySha256.toString("base64") !== "expected-base64-digest=") {
  //       throw new Error("host key mismatch");
  //     }
  //   },
  // },
});

process.stdout.write(stdoutText);
