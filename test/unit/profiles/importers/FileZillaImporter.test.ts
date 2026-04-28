import { describe, expect, it } from "vitest";
import { importFileZillaSites } from "../../../../src/index";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FileZilla3>
  <Servers>
    <Folder>
      <Name>Production</Name>
      <Server>
        <Host>sftp.example.com</Host>
        <Port>22</Port>
        <Protocol>1</Protocol>
        <User>tony</User>
        <Pass encoding="base64">c2VjcmV0</Pass>
        <Logontype>1</Logontype>
        <Name>Prod SFTP</Name>
      </Server>
      <Folder>
        <Name>Legacy</Name>
        <Server>
          <Host>ftp.example.com</Host>
          <Port>21</Port>
          <Protocol>0</Protocol>
          <User>anon</User>
          <Name>Legacy FTP</Name>
        </Server>
      </Folder>
    </Folder>
    <Server>
      <Host>cloud.example.com</Host>
      <Protocol>13</Protocol>
      <Name>GCP Bucket</Name>
    </Server>
  </Servers>
</FileZilla3>`;

describe("importFileZillaSites", () => {
  it("parses sites and decodes base64 passwords", () => {
    const { sites, skipped } = importFileZillaSites(xml);
    expect(sites).toHaveLength(2);
    const prod = sites.find((site) => site.name === "Prod SFTP");
    expect(prod?.folder).toEqual(["Production"]);
    expect(prod?.profile.provider).toBe("sftp");
    expect(prod?.profile.port).toBe(22);
    expect(prod?.password).toBe("secret");
    const legacy = sites.find((site) => site.name === "Legacy FTP");
    expect(legacy?.folder).toEqual(["Production", "Legacy"]);
    expect(legacy?.profile.provider).toBe("ftp");
    expect(skipped).toHaveLength(1);
    expect(skipped[0]?.protocol).toBe(13);
  });

  it("throws when XML is empty", () => {
    expect(() => importFileZillaSites("")).toThrow(/empty/);
  });
});
