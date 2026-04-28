/**
 * MFT route definitions.
 *
 * Routes are named, declarative source→destination policies that bind a pair
 * of {@link ConnectionProfile} values, the paths being moved, and optional
 * filtering metadata. Routes are pure data; the {@link runRoute} executor and
 * the {@link RouteRegistry} wrap them with execution and lookup behavior.
 *
 * @module mft/MftRoute
 */
import type { TransferOperation } from "../transfers/TransferJob";
import type { ConnectionProfile } from "../types/public";

/** Endpoint inside an MFT route. */
export interface MftRouteEndpoint {
  /** Connection profile used to open a provider session for the endpoint. */
  profile: ConnectionProfile;
  /** Provider, remote, or local path the route operates on. */
  path: string;
}

/** Optional filter metadata reserved for tree-aware route execution. */
export interface MftRouteFilter {
  /** Glob patterns whose matches should be included. */
  include?: readonly string[];
  /** Glob patterns whose matches should be excluded. */
  exclude?: readonly string[];
}

/** Transfer operations supported by route executors. */
export type MftRouteOperation = Extract<TransferOperation, "copy" | "download" | "upload">;

/** Declarative source→destination policy bound to provider profiles. */
export interface MftRoute {
  /** Stable route identifier. */
  id: string;
  /** Optional human-readable route name. */
  name?: string;
  /** Optional human-readable description. */
  description?: string;
  /** Source endpoint resolved through the transfer client. */
  source: MftRouteEndpoint;
  /** Destination endpoint resolved through the transfer client. */
  destination: MftRouteEndpoint;
  /** Optional include/exclude filter, reserved for tree-aware executors. */
  filter?: MftRouteFilter;
  /** Transfer operation performed by the route. Defaults to `"copy"`. */
  operation?: MftRouteOperation;
  /** Whether the route is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Caller-defined metadata retained for diagnostics and audit records. */
  metadata?: Record<string, unknown>;
}
