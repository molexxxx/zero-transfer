# Publishing ZeroTransfer

This repo publishes **13 packages** under [`@zero-transfer/*`](https://www.npmjs.com/org/zero-transfer):

- `@zero-transfer/sdk` — batteries-included
- `@zero-transfer/{core,classic,ftp,ftps,sftp,http,webdav,s3,google-drive,dropbox,azure-blob,mft}` — narrowed scopes generated from [`scripts/scope-manifest.mjs`](./scripts/scope-manifest.mjs).

All publishing runs through **GitHub Actions OIDC trusted publishing** (no `NPM_TOKEN` secret). You only need git access to `tonywied17/zero-transfer`.

## TL;DR — release in one command

```powershell
npm run release:patch     # 0.1.1 -> 0.1.2
npm run release:minor     # 0.1.1 -> 0.2.0
npm run release:major     # 0.1.1 -> 1.0.0
npm run release:alpha     # 0.1.1 -> 0.1.2-alpha.0
npm run release:beta      # 0.1.1 -> 0.1.2-beta.0
npm run release:rc        # 0.1.1 -> 0.1.2-rc.0
npm run release -- 1.2.3  # explicit version
npm run release -- patch --no-push   # bump + commit, don't push yet
```

That single command:

1. Verifies you're on `main` with a clean working tree.
2. Runs `npm run ci` (lint, format check, typecheck, test+coverage, build, `pack:dry`).
3. Bumps `package.json` via `npm version <bump> --no-git-tag-version`.
4. Runs `npm run packages:generate` — rewrites every `packages/<scope>/package.json` and `dist/*` to match the new version and the manifest.
5. Runs `npm run docs:all` — regenerates HTML (`docs/api/`), Markdown API reference (`docs/api-md/`), and per-scope pages (`docs/scopes/*.md`).
6. Commits everything as `chore(release): v<version>` and pushes to `origin/main`.

Pushing the bumped `package.json` triggers the rest automatically — see below.

## What happens after `git push`

```
push to main (package.json version changed)
        │
        ▼
.github/workflows/release-on-bump.yml
  • detects version diff vs HEAD~1
  • creates git tag v<version>
  • creates GitHub Release (auto --prerelease for alpha/beta/rc/next/dev/pre)
        │
        ▼   (release.published event)
.github/workflows/release.yml
  • npm ci + npm run ci  (gate)
  • npm run packages:generate
  • npm run docs:all
  • npm publish --provenance --access public --tag <alpha|latest>      ← @zero-transfer/sdk
  • for each packages/*/, npm publish ...                              ← 12 narrowed packages
        │
        ▼
13 packages live on npmjs with provenance attestations
```

The `release.yml` job re-runs `packages:generate` and `docs:all` as a safety net so the published artifacts always match the manifest, even if a contributor pushed a bump without running the local pipeline.

## Manual release (no bump script)

If you want to bump by hand:

```powershell
git switch main
git pull
npm run ci
npm version patch --no-git-tag-version
npm run packages:generate
npm run docs:all
git add -A
git commit -m "chore(release): vX.Y.Z"
git push origin main
```

## One-off publish (workflow_dispatch)

`release.yml` also supports manual dispatch from the **Actions** tab → **Release** → **Run workflow**:

| Input     | Default | Purpose                                           |
| --------- | ------- | ------------------------------------------------- |
| `tag`     | `alpha` | npm dist-tag (`alpha`, `beta`, `rc`, `latest`, …) |
| `dry_run` | `false` | If `true`, runs `npm publish --dry-run` only      |

Use this to re-publish without bumping (e.g. a failed tag publish) or to do a dry run.

## OIDC trusted publishing — one-time setup

Each of the 13 packages must register this repo as a Trusted Publisher on npmjs.com. Per package, on https://www.npmjs.com/package/@zero-transfer/&lt;name&gt;:

1. **Settings** → **Publishing access** → **Add trusted publisher**
2. Repository: `tonywied17/zero-transfer`
3. Workflow filename: `release.yml`
4. Environment: _(blank)_

Until this is done for a package, OIDC publish fails with `403`. Workaround: set `NPM_TOKEN` as a repo secret and pass `--access public` only (no `--provenance`).

## Adding a new scoped package

1. Add a new entry to [`scripts/scope-manifest.mjs`](./scripts/scope-manifest.mjs):
   ```js
   {
     name: "newscope",
     title: "NewScope",
     summary: "One-line summary.",
     description: "Multi-line description.",
     exports: ["createNewProviderFactory", "NewProviderOptions"],
     examples: ["new-example.ts"],
   }
   ```
2. Run `npm run packages:generate` and `npm run docs:scopes` to scaffold `packages/newscope/` and `docs/scopes/newscope.md`.
3. Register OIDC trusted publishing for `@zero-transfer/newscope` on npmjs.com (see above).
4. Update [`README.md`](./README.md) scoped-packages table.
5. Release as usual: `npm run release:patch`.

The CI test [`test/unit/scoped-packages.smoke.test.ts`](./test/unit/scoped-packages.smoke.test.ts) auto-asserts every manifest scope produces a narrowed package — it'll fail if the workspace folder is missing or exports drift from the manifest.

## Troubleshooting

| Symptom                                                                      | Fix                                                                                                   |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run release:*` fails on "refusing to release with a dirty working tree" | `git status` → commit or stash pending changes first.                                                 |
| `release-on-bump.yml` doesn't run                                            | Ensure the push actually changed `package.json`'s `version` field. Workflow ignores other edits.      |
| `release.yml` fails with `403` on `npm publish`                              | The package isn't registered as OIDC trusted publisher yet. See OIDC section above.                   |
| `npm run release` says "refusing to release from branch 'X'; switch to main" | Releases must come from `main`. Merge first, then release.                                            |
| Tag `v<version>` already exists                                              | `release-on-bump.yml` skips. Bump again with the next version.                                        |
| Need to retract                                                              | `npm deprecate @zero-transfer/<pkg>@<version> "reason"` per package, or `npm unpublish` (within 72h). |
