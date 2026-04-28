/**
 * Friendly one-call helpers built on top of {@link runRoute}.
 *
 * These helpers give applications a quick surface for the common single-file flows
 * (`uploadFile`, `downloadFile`, `copyBetween`) without forcing them to assemble
 * {@link MftRoute} objects directly. Each helper composes a one-shot route and
 * delegates execution to the existing route runner so retry, abort, progress,
 * timeout, and bandwidth controls behave identically to scheduled runs.
 *
 * @module client/operations
 */
import { isAbsolute, resolve as resolvePath } from "node:path";
import type { TransferClient } from "../core/TransferClient";
import type { MftRoute } from "../mft/MftRoute";
import { runRoute, type RunRouteOptions } from "../mft/runRoute";
import type { TransferReceipt } from "../transfers/TransferJob";
import type { ConnectionProfile } from "../types/public";

/** Endpoint shape accepted by the friendly helpers. */
export interface RemoteFileEndpoint {
  /** Provider profile used to open the session. */
  profile: ConnectionProfile;
  /** Provider, remote, or local path the helper operates on. */
  path: string;
}

/** Shared options consumed by {@link uploadFile}, {@link downloadFile}, and {@link copyBetween}. */
export type FriendlyTransferOptions = Omit<RunRouteOptions, "client" | "route"> & {
  /** Stable route id assigned to the synthetic route. Defaults to `"upload:..."`, `"download:..."`, or `"copy:..."`. */
  routeId?: string;
  /** Optional human-readable route name forwarded to telemetry. */
  routeName?: string;
};

/** Connection profile for the local filesystem provider. */
const LOCAL_PROFILE: ConnectionProfile = { host: "local", provider: "local" };

/** Options for {@link uploadFile}. */
export interface UploadFileOptions extends FriendlyTransferOptions {
  /** Transfer client used to resolve both endpoint providers. */
  client: TransferClient;
  /** Local source path. Relative paths are resolved against `process.cwd()`. */
  localPath: string;
  /** Remote destination endpoint. */
  destination: RemoteFileEndpoint;
}

/**
 * Uploads a single local file to a remote endpoint.
 *
 * @param options - Friendly upload options.
 * @returns Receipt produced by the underlying transfer engine.
 */
export function uploadFile(options: UploadFileOptions): Promise<TransferReceipt> {
  const { client, destination, localPath, routeId, routeName, ...rest } = options;
  const route = buildRoute({
    destination: { path: destination.path, profile: destination.profile },
    id: routeId ?? `upload:${defaultRouteSuffix(localPath, destination.path)}`,
    name: routeName,
    operation: "upload",
    source: { path: absolutePath(localPath), profile: LOCAL_PROFILE },
  });
  return runRoute({ client, route, ...rest });
}

/** Options for {@link downloadFile}. */
export interface DownloadFileOptions extends FriendlyTransferOptions {
  /** Transfer client used to resolve both endpoint providers. */
  client: TransferClient;
  /** Remote source endpoint. */
  source: RemoteFileEndpoint;
  /** Local destination path. Relative paths are resolved against `process.cwd()`. */
  localPath: string;
}

/**
 * Downloads a single remote file to a local path.
 *
 * @param options - Friendly download options.
 * @returns Receipt produced by the underlying transfer engine.
 */
export function downloadFile(options: DownloadFileOptions): Promise<TransferReceipt> {
  const { client, localPath, routeId, routeName, source, ...rest } = options;
  const route = buildRoute({
    destination: { path: absolutePath(localPath), profile: LOCAL_PROFILE },
    id: routeId ?? `download:${defaultRouteSuffix(source.path, localPath)}`,
    name: routeName,
    operation: "download",
    source: { path: source.path, profile: source.profile },
  });
  return runRoute({ client, route, ...rest });
}

/** Options for {@link copyBetween}. */
export interface CopyBetweenOptions extends FriendlyTransferOptions {
  /** Transfer client used to resolve both endpoint providers. */
  client: TransferClient;
  /** Source remote endpoint. */
  source: RemoteFileEndpoint;
  /** Destination remote endpoint. */
  destination: RemoteFileEndpoint;
}

/**
 * Copies a file between two remote endpoints in a single call.
 *
 * @param options - Friendly copy options.
 * @returns Receipt produced by the underlying transfer engine.
 */
export function copyBetween(options: CopyBetweenOptions): Promise<TransferReceipt> {
  const { client, destination, routeId, routeName, source, ...rest } = options;
  const route = buildRoute({
    destination: { path: destination.path, profile: destination.profile },
    id: routeId ?? `copy:${defaultRouteSuffix(source.path, destination.path)}`,
    name: routeName,
    operation: "copy",
    source: { path: source.path, profile: source.profile },
  });
  return runRoute({ client, route, ...rest });
}

interface BuildRouteInput {
  id: string;
  name?: string | undefined;
  operation: NonNullable<MftRoute["operation"]>;
  source: MftRoute["source"];
  destination: MftRoute["destination"];
}

function buildRoute(input: BuildRouteInput): MftRoute {
  const route: MftRoute = {
    destination: input.destination,
    id: input.id,
    operation: input.operation,
    source: input.source,
  };
  if (input.name !== undefined) route.name = input.name;
  return route;
}

function absolutePath(localPath: string): string {
  return isAbsolute(localPath) ? localPath : resolvePath(localPath);
}

function defaultRouteSuffix(source: string, destination: string): string {
  return `${source}->${destination}`;
}
