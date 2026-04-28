/**
 * Opt-in cloud-drive integration tests.
 *
 * These tests are skipped unless the following environment variables are set,
 * isolating them from default CI runs and ensuring no live credentials are
 * required to clone the repo:
 *
 * - `ZT_DROPBOX_TOKEN` — Dropbox OAuth access token. Optional `ZT_DROPBOX_PATH`
 *   selects the folder to list (defaults to `/`).
 * - `ZT_GDRIVE_TOKEN` — Google Drive OAuth access token. Optional
 *   `ZT_GDRIVE_FOLDER_ID` scopes path resolution to a folder id.
 * - `ZT_ONEDRIVE_TOKEN` — Microsoft Graph OAuth access token. Optional
 *   `ZT_ONEDRIVE_DRIVE_BASE_URL` overrides the drive base.
 * - `ZT_GCS_TOKEN` + `ZT_GCS_BUCKET` — Google Cloud Storage credentials.
 * - `ZT_AZURE_BLOB_CONTAINER` + `ZT_AZURE_BLOB_ACCOUNT` + (`ZT_AZURE_BLOB_SAS`
 *   or `ZT_AZURE_BLOB_TOKEN`) — Azure Blob credentials.
 *
 * Every covered provider issues a single `list("/")` call against live
 * credentials and asserts the call succeeds. The tests intentionally avoid
 * mutating storage so they are safe to run against shared accounts.
 */
import { describe, expect, it } from "vitest";
import {
  createAzureBlobProviderFactory,
  createDropboxProviderFactory,
  createGcsProviderFactory,
  createGoogleDriveProviderFactory,
  createOneDriveProviderFactory,
} from "../../src/index";

const env = process.env;

const dropboxRunner = env["ZT_DROPBOX_TOKEN"] !== undefined ? it : it.skip;
dropboxRunner("Dropbox: list / with a live token", async () => {
  const factory = createDropboxProviderFactory({});
  const session = await factory.create().connect({
    host: "",
    password: env["ZT_DROPBOX_TOKEN"]!,
    protocol: "ftp",
  });
  const target = env["ZT_DROPBOX_PATH"] ?? "/";
  const entries = await session.fs.list(target);
  expect(Array.isArray(entries)).toBe(true);
});

const gdriveRunner = env["ZT_GDRIVE_TOKEN"] !== undefined ? it : it.skip;
gdriveRunner("Google Drive: list / with a live token", async () => {
  const factoryOpts: Parameters<typeof createGoogleDriveProviderFactory>[0] = {};
  if (env["ZT_GDRIVE_FOLDER_ID"] !== undefined) {
    factoryOpts.rootFolderId = env["ZT_GDRIVE_FOLDER_ID"];
  }
  const factory = createGoogleDriveProviderFactory(factoryOpts);
  const session = await factory.create().connect({
    host: "",
    password: env["ZT_GDRIVE_TOKEN"]!,
    protocol: "ftp",
  });
  const entries = await session.fs.list("/");
  expect(Array.isArray(entries)).toBe(true);
});

const oneDriveRunner = env["ZT_ONEDRIVE_TOKEN"] !== undefined ? it : it.skip;
oneDriveRunner("OneDrive: list / with a live token", async () => {
  const factoryOpts: Parameters<typeof createOneDriveProviderFactory>[0] = {};
  if (env["ZT_ONEDRIVE_DRIVE_BASE_URL"] !== undefined) {
    factoryOpts.driveBaseUrl = env["ZT_ONEDRIVE_DRIVE_BASE_URL"];
  }
  const factory = createOneDriveProviderFactory(factoryOpts);
  const session = await factory.create().connect({
    host: "",
    password: env["ZT_ONEDRIVE_TOKEN"]!,
    protocol: "ftp",
  });
  const entries = await session.fs.list("/");
  expect(Array.isArray(entries)).toBe(true);
});

const gcsRunner =
  env["ZT_GCS_TOKEN"] !== undefined && env["ZT_GCS_BUCKET"] !== undefined ? it : it.skip;
gcsRunner("GCS: list / with a live token", async () => {
  const factory = createGcsProviderFactory({ bucket: env["ZT_GCS_BUCKET"]! });
  const session = await factory.create().connect({
    host: "",
    password: env["ZT_GCS_TOKEN"]!,
    protocol: "ftp",
  });
  const entries = await session.fs.list("/");
  expect(Array.isArray(entries)).toBe(true);
});

const azureRunner =
  env["ZT_AZURE_BLOB_ACCOUNT"] !== undefined &&
  env["ZT_AZURE_BLOB_CONTAINER"] !== undefined &&
  (env["ZT_AZURE_BLOB_SAS"] !== undefined || env["ZT_AZURE_BLOB_TOKEN"] !== undefined)
    ? it
    : it.skip;
azureRunner("Azure Blob: list / with live credentials", async () => {
  const factoryOpts: Parameters<typeof createAzureBlobProviderFactory>[0] = {
    account: env["ZT_AZURE_BLOB_ACCOUNT"]!,
    container: env["ZT_AZURE_BLOB_CONTAINER"]!,
  };
  if (env["ZT_AZURE_BLOB_SAS"] !== undefined) {
    factoryOpts.sasToken = env["ZT_AZURE_BLOB_SAS"];
  }
  const factory = createAzureBlobProviderFactory(factoryOpts);
  const profile: Parameters<ReturnType<typeof factory.create>["connect"]>[0] = {
    host: "",
    protocol: "ftp",
  };
  if (env["ZT_AZURE_BLOB_TOKEN"] !== undefined) {
    profile.password = env["ZT_AZURE_BLOB_TOKEN"];
  }
  const session = await factory.create().connect(profile);
  const entries = await session.fs.list("/");
  expect(Array.isArray(entries)).toBe(true);
});

describe("cloud provider integration tests", () => {
  it("are gated by environment variables (this test always passes)", () => {
    // Anchor describe block so the file always runs at least one assertion.
    expect(true).toBe(true);
  });
});
