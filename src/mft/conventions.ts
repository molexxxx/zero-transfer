/**
 * Inbox and outbox conventions for MFT routes.
 *
 * Conventions describe well-known directory layouts so callers can model
 * pickup/drop-off folders without reinventing path math. {@link createInboxRoute}
 * and {@link createOutboxRoute} produce {@link MftRoute} values that point at
 * the correct directories and surface helper paths (processed/failed subfolders)
 * via the route metadata. {@link inboxProcessedPath} / {@link inboxFailedPath}
 * expose those derived paths for callers that orchestrate post-transfer cleanup.
 *
 * @module mft/conventions
 */
import type { ConnectionProfile } from "../types/public";
import { joinRemotePath } from "../utils/path";
import type { MftRoute, MftRouteFilter, MftRouteOperation } from "./MftRoute";

/** Default subdirectory used to archive successfully processed inbox files. */
export const DEFAULT_PROCESSED_SUBDIR = "processed";

/** Default subdirectory used to quarantine files that failed processing. */
export const DEFAULT_FAILED_SUBDIR = "failed";

/** Inbox layout convention. */
export interface MftInboxConvention {
  /** Profile used to connect to the inbox provider. */
  profile: ConnectionProfile;
  /** Base inbox directory where files arrive. */
  basePath: string;
  /** Subdirectory for processed files. Defaults to `"processed"`. */
  processedSubdir?: string;
  /** Subdirectory for failed files. Defaults to `"failed"`. */
  failedSubdir?: string;
  /** Filter applied to entries discovered under the base path. */
  filter?: MftRouteFilter;
}

/** Outbox layout convention. */
export interface MftOutboxConvention {
  /** Profile used to connect to the outbox provider. */
  profile: ConnectionProfile;
  /** Base outbox directory where files are dropped. */
  basePath: string;
}

/** Endpoint shape used by {@link createInboxRoute}/{@link createOutboxRoute}. */
export interface ConventionEndpoint {
  /** Profile used to connect to the endpoint provider. */
  profile: ConnectionProfile;
  /** Path on the endpoint side. */
  path: string;
}

/** Options accepted by {@link createInboxRoute}. */
export interface CreateInboxRouteOptions {
  /** Stable route id. */
  id: string;
  /** Optional human-friendly route name. */
  name?: string;
  /** Optional human-friendly description. */
  description?: string;
  /** Inbox convention. */
  inbox: MftInboxConvention;
  /** Destination endpoint that receives files from the inbox. */
  destination: ConventionEndpoint;
  /** Optional operation override. Defaults to `"copy"`. */
  operation?: MftRouteOperation;
  /** Whether the route is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Caller-defined metadata merged into the route. */
  metadata?: Record<string, unknown>;
}

/** Options accepted by {@link createOutboxRoute}. */
export interface CreateOutboxRouteOptions {
  /** Stable route id. */
  id: string;
  /** Optional human-friendly route name. */
  name?: string;
  /** Optional human-friendly description. */
  description?: string;
  /** Source endpoint that supplies files into the outbox. */
  source: ConventionEndpoint;
  /** Outbox convention. */
  outbox: MftOutboxConvention;
  /** Optional operation override. Defaults to `"copy"`. */
  operation?: MftRouteOperation;
  /** Whether the route is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Caller-defined metadata merged into the route. */
  metadata?: Record<string, unknown>;
}

/**
 * Computes the absolute path used to archive successfully processed files.
 *
 * @param inbox - Inbox convention.
 * @returns Absolute path to the processed subdirectory under {@link MftInboxConvention.basePath}.
 */
export function inboxProcessedPath(inbox: MftInboxConvention): string {
  return joinRemotePath(inbox.basePath, inbox.processedSubdir ?? DEFAULT_PROCESSED_SUBDIR);
}

/**
 * Computes the absolute path used to quarantine failed files.
 *
 * @param inbox - Inbox convention.
 * @returns Absolute path to the failed subdirectory under {@link MftInboxConvention.basePath}.
 */
export function inboxFailedPath(inbox: MftInboxConvention): string {
  return joinRemotePath(inbox.basePath, inbox.failedSubdir ?? DEFAULT_FAILED_SUBDIR);
}

/**
 * Creates a route that pulls files out of an inbox into a destination directory.
 *
 * @param options - Inbox layout, destination endpoint, and optional metadata.
 * @returns An {@link MftRoute} ready to register with {@link RouteRegistry}.
 */
export function createInboxRoute(options: CreateInboxRouteOptions): MftRoute {
  const route: MftRoute = {
    destination: { path: options.destination.path, profile: options.destination.profile },
    id: options.id,
    metadata: {
      ...options.metadata,
      inbox: {
        basePath: options.inbox.basePath,
        failedPath: inboxFailedPath(options.inbox),
        processedPath: inboxProcessedPath(options.inbox),
      },
    },
    source: { path: options.inbox.basePath, profile: options.inbox.profile },
  };

  if (options.name !== undefined) route.name = options.name;
  if (options.description !== undefined) route.description = options.description;
  if (options.operation !== undefined) route.operation = options.operation;
  if (options.enabled !== undefined) route.enabled = options.enabled;
  if (options.inbox.filter !== undefined) route.filter = options.inbox.filter;

  return route;
}

/**
 * Creates a route that drops files from a source endpoint into an outbox directory.
 *
 * @param options - Source endpoint, outbox layout, and optional metadata.
 * @returns An {@link MftRoute} ready to register with {@link RouteRegistry}.
 */
export function createOutboxRoute(options: CreateOutboxRouteOptions): MftRoute {
  const route: MftRoute = {
    destination: { path: options.outbox.basePath, profile: options.outbox.profile },
    id: options.id,
    metadata: {
      ...options.metadata,
      outbox: {
        basePath: options.outbox.basePath,
      },
    },
    source: { path: options.source.path, profile: options.source.profile },
  };

  if (options.name !== undefined) route.name = options.name;
  if (options.description !== undefined) route.description = options.description;
  if (options.operation !== undefined) route.operation = options.operation;
  if (options.enabled !== undefined) route.enabled = options.enabled;

  return route;
}
