// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

// https://astro.build/config
export default defineConfig({
  // Project page on GitHub Pages → served under /zero-transfer/.
  // Override at build time with `SITE_URL` / `BASE_PATH` env vars when
  // deploying somewhere else (custom domain, Cloudflare Pages, Vercel, …).
  site: process.env.SITE_URL ?? "https://tonywied17.github.io/zero-transfer/",
  base: process.env.BASE_PATH ?? "/zero-transfer/",
  integrations: [
    starlight({
      title: "Zero Transfer SDK",
      description:
        "Unified TypeScript file transfer SDK for Node.js. One API across SFTP, FTP, FTPS, S3, Azure Blob, GCS, WebDAV, HTTP, and the major cloud drives.",
      logo: {
        src: "./src/assets/logo.svg",
        replacesTitle: false,
      },
      favicon: "/favicon.svg",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/tonywied17/zero-transfer",
        },
        {
          icon: "npm",
          label: "npm",
          href: "https://www.npmjs.com/package/@zero-transfer/sdk",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/tonywied17/zero-transfer/edit/main/website/",
      },
      lastUpdated: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      plugins: [
        // Generates API reference markdown from src/index.ts at build time
        // and exposes a `typeDocSidebarGroup` we can drop into the sidebar.
        starlightTypeDoc({
          entryPoints: ["../src/index.ts"],
          tsconfig: "../tsconfig.json",
          output: "api",
          sidebar: {
            label: "API reference",
            collapsed: true,
          },
          typeDoc: {
            excludeInternal: true,
            excludePrivate: true,
            excludeProtected: false,
            categorizeByGroup: true,
            includeVersion: true,
            githubPages: false,
            useCodeBlocks: true,
            expandObjects: true,
            expandParameters: true,
            parametersFormat: "table",
            propertiesFormat: "table",
            enumMembersFormat: "table",
            typeDeclarationFormat: "table",
            sort: ["kind", "alphabetical"],
            // Emit the entry doc as index.md so Starlight maps it to /api/
            // instead of /api/readme/.
            entryFileName: "index.md",
          },
        }),
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Introduction", link: "/" },
            { label: "Getting started", link: "/guides/getting-started/" },
            {
              label: "Connection profiles",
              link: "/guides/connection-profiles/",
            },
            { label: "Capability matrix", link: "/guides/capabilities/" },
            { label: "Examples", link: "/guides/examples/" },
          ],
        },
        {
          label: "Concepts",
          items: [
            { label: "Sessions & operations", link: "/concepts/sessions/" },
            { label: "Transfers & sync", link: "/concepts/transfers/" },
            { label: "MFT routes", link: "/concepts/mft/" },
            { label: "Errors & diagnostics", link: "/concepts/errors/" },
          ],
        },
        // Auto-generated TypeDoc sidebar group
        typeDocSidebarGroup,
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
