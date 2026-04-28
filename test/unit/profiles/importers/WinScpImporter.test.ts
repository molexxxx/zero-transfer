import { describe, expect, it } from "vitest";
import { importWinScpSessions } from "../../../../src/index";

const ini = `[Configuration]
Version=6.3.5

[Sessions\\Production%2FSFTP%20main]
HostName=sftp.example.com
PortNumber=22
UserName=tony
FSProtocol=2
PublicKeyFile=C:\\\\keys\\\\id_rsa.ppk

[Sessions\\Legacy%20FTPS]
HostName=ftps.example.com
PortNumber=990
UserName=ftpuser
FSProtocol=5
Ftps=1

[Sessions\\Plain%20FTP]
HostName=ftp.example.com
FSProtocol=5
Ftps=0

[Sessions\\Unsupported]
HostName=cloud.example.com
FSProtocol=7
`;

describe("importWinScpSessions", () => {
  it("parses SFTP, FTPS, and FTP sessions and skips unsupported ones", () => {
    const { sessions, skipped } = importWinScpSessions(ini);
    expect(sessions).toHaveLength(3);

    const sftp = sessions.find((session) => session.name === "SFTP main");
    expect(sftp?.folder).toEqual(["Production"]);
    expect(sftp?.profile.provider).toBe("sftp");
    const privateKey = sftp?.profile.ssh?.privateKey;
    if (typeof privateKey !== "object" || privateKey === null || !("path" in privateKey)) {
      throw new Error("expected FileSecretSource privateKey");
    }
    expect(privateKey.path).toContain("id_rsa.ppk");

    const ftps = sessions.find((session) => session.name === "Legacy FTPS");
    expect(ftps?.profile.provider).toBe("ftps");
    expect(ftps?.profile.secure).toBe(true);
    expect(ftps?.ftps).toBe(1);

    const ftp = sessions.find((session) => session.name === "Plain FTP");
    expect(ftp?.profile.provider).toBe("ftp");

    expect(skipped).toHaveLength(1);
    expect(skipped[0]?.fsProtocol).toBe(7);
  });

  it("throws when no Sessions\\ entries are present", () => {
    expect(() => importWinScpSessions("[Configuration]\nVersion=6.0\n")).toThrow(/Sessions/);
  });
});
