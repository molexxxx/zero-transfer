/**
 * In-memory registry of MFT routes.
 *
 * Routes are keyed by {@link MftRoute.id}. The registry enforces unique ids
 * and exposes a small, ordered API used by route executors and audit tooling.
 *
 * @module mft/RouteRegistry
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import type { MftRoute } from "./MftRoute";

/** Mutable in-memory registry of MFT routes. */
export class RouteRegistry {
  private readonly routes = new Map<string, MftRoute>();

  /**
   * Creates a registry and optionally seeds it with route definitions.
   *
   * @param routes - Routes to register immediately.
   */
  constructor(routes: Iterable<MftRoute> = []) {
    for (const route of routes) {
      this.register(route);
    }
  }

  /**
   * Registers a route definition.
   *
   * @param route - Route to add.
   * @returns This registry for fluent setup.
   * @throws {@link ConfigurationError} When the route id is already registered or empty.
   */
  register(route: MftRoute): this {
    if (route.id.length === 0) {
      throw new ConfigurationError({
        message: "MFT route id must be a non-empty string",
        retryable: false,
      });
    }

    if (this.routes.has(route.id)) {
      throw new ConfigurationError({
        details: { routeId: route.id },
        message: `MFT route "${route.id}" is already registered`,
        retryable: false,
      });
    }

    this.routes.set(route.id, route);
    return this;
  }

  /**
   * Removes a route from the registry.
   *
   * @param routeId - Route id to remove.
   * @returns `true` when a route was removed.
   */
  unregister(routeId: string): boolean {
    return this.routes.delete(routeId);
  }

  /**
   * Checks whether a route id is registered.
   *
   * @param routeId - Route id to inspect.
   * @returns `true` when a route exists.
   */
  has(routeId: string): boolean {
    return this.routes.has(routeId);
  }

  /**
   * Gets a route definition when registered.
   *
   * @param routeId - Route id to retrieve.
   * @returns The route, or `undefined` when missing.
   */
  get(routeId: string): MftRoute | undefined {
    return this.routes.get(routeId);
  }

  /**
   * Gets a route definition or throws a typed SDK error.
   *
   * @param routeId - Route id to retrieve.
   * @returns The registered route.
   * @throws {@link ConfigurationError} When no route is registered under the id.
   */
  require(routeId: string): MftRoute {
    const route = this.routes.get(routeId);

    if (route === undefined) {
      throw new ConfigurationError({
        details: { routeId },
        message: `MFT route "${routeId}" is not registered`,
        retryable: false,
      });
    }

    return route;
  }

  /**
   * Returns all registered routes in registration order.
   *
   * @returns Array of route definitions.
   */
  list(): MftRoute[] {
    return Array.from(this.routes.values());
  }

  /** Returns the number of routes currently registered. */
  get size(): number {
    return this.routes.size;
  }
}
