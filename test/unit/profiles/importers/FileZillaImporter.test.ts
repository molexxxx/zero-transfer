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

  it("maps protocol 4 (FTPS implicit) and 5 (FTPS explicit) to ftps with secure=true", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server>
          <Host>a.example</Host><Protocol>4</Protocol><Name>A</Name>
        </Server>
        <Server>
          <Host>b.example</Host><Protocol>5</Protocol><Name>B</Name>
        </Server>
        <Server>
          <Host>c.example</Host><Protocol>6</Protocol><Name>C</Name>
        </Server>
      </Servers></FileZilla3>`);
    const a = result.sites.find((s) => s.name === "A");
    const b = result.sites.find((s) => s.name === "B");
    const c = result.sites.find((s) => s.name === "C");
    expect(a?.profile.provider).toBe("ftps");
    expect(a?.profile.secure).toBe(true);
    expect(b?.profile.provider).toBe("ftps");
    expect(c?.profile.provider).toBe("ftp");
    expect(c?.profile.secure).toBe(false);
  });

  it("skips sites whose host is empty", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server><Host></Host><Name>NoHost</Name></Server>
      </Servers></FileZilla3>`);
    expect(result.sites).toHaveLength(0);
    expect(result.skipped[0]?.name).toBe("NoHost");
  });

  it("skips sites with non-numeric protocol", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server><Host>a.example</Host><Protocol>notanumber</Protocol><Name>X</Name></Server>
      </Servers></FileZilla3>`);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]?.name).toBe("X");
  });

  it("falls back to host as the site name when Name is missing", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server><Host>fallback.example</Host><Protocol>0</Protocol></Server>
      </Servers></FileZilla3>`);
    expect(result.sites[0]?.name).toBe("fallback.example");
  });

  it("retains plaintext passwords when no encoding attribute is present", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server>
          <Host>plain.example</Host><Protocol>0</Protocol>
          <Pass>plaintext</Pass><Name>P</Name>
        </Server>
      </Servers></FileZilla3>`);
    expect(result.sites[0]?.password).toBe("plaintext");
  });

  it("ignores invalid port numbers", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server>
          <Host>p.example</Host><Protocol>0</Protocol><Port>notaport</Port><Name>P</Name>
        </Server>
      </Servers></FileZilla3>`);
    expect(result.sites[0]?.profile.port).toBeUndefined();
  });

  it("ignores invalid Logontype values", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server>
          <Host>l.example</Host><Protocol>0</Protocol><Logontype>nope</Logontype><Name>L</Name>
        </Server>
      </Servers></FileZilla3>`);
    expect(result.sites[0]?.logonType).toBeUndefined();
  });

  it("decodes XML entities and CDATA sections", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <FileZilla3><Servers>
        <Server>
          <Host>e.example</Host><Protocol>0</Protocol>
          <User>ann&amp;bob</User>
          <Name><![CDATA[Big & Tasty]]></Name>
        </Server>
      </Servers></FileZilla3>`);
    expect(result.sites[0]?.name).toBe("Big & Tasty");
    expect(result.sites[0]?.profile.username).toEqual({ value: "ann&bob" });
  });

  it("ignores comments and processing instructions in the XML body", () => {
    const result = importFileZillaSites(`<?xml version="1.0"?>
      <!-- pre-comment -->
      <FileZilla3><Servers>
        <!-- in body -->
        <Server>
          <Host>c.example</Host><Protocol>0</Protocol><Name>C</Name>
        </Server>
      </Servers></FileZilla3>`);
    expect(result.sites).toHaveLength(1);
    expect(result.sites[0]?.name).toBe("C");
  });
});
