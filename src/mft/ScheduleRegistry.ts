/**
 * In-memory registry of MFT schedules.
 *
 * @module mft/ScheduleRegistry
 */
import { ConfigurationError } from "../errors/ZeroTransferError";
import { validateSchedule, type MftSchedule } from "./MftSchedule";

/** Mutable in-memory registry of MFT schedules. */
export class ScheduleRegistry {
  private readonly schedules = new Map<string, MftSchedule>();

  /**
   * Creates a registry and optionally seeds it with schedules.
   *
   * @param schedules - Schedules to register immediately.
   */
  constructor(schedules: Iterable<MftSchedule> = []) {
    for (const schedule of schedules) {
      this.register(schedule);
    }
  }

  /**
   * Registers a schedule.
   *
   * @param schedule - Schedule to add.
   * @returns This registry for fluent setup.
   * @throws {@link ConfigurationError} When the schedule is malformed or a duplicate.
   */
  register(schedule: MftSchedule): this {
    validateSchedule(schedule);

    if (this.schedules.has(schedule.id)) {
      throw new ConfigurationError({
        details: { scheduleId: schedule.id },
        message: `MFT schedule "${schedule.id}" is already registered`,
        retryable: false,
      });
    }

    this.schedules.set(schedule.id, schedule);
    return this;
  }

  /**
   * Removes a schedule.
   *
   * @param scheduleId - Schedule id to remove.
   * @returns `true` when a schedule was removed.
   */
  unregister(scheduleId: string): boolean {
    return this.schedules.delete(scheduleId);
  }

  /** Checks whether a schedule id is registered. */
  has(scheduleId: string): boolean {
    return this.schedules.has(scheduleId);
  }

  /** Gets a schedule when registered. */
  get(scheduleId: string): MftSchedule | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * Gets a schedule or throws when missing.
   *
   * @param scheduleId - Schedule id to retrieve.
   * @returns The schedule.
   * @throws {@link ConfigurationError} When no schedule is registered under the id.
   */
  require(scheduleId: string): MftSchedule {
    const schedule = this.schedules.get(scheduleId);

    if (schedule === undefined) {
      throw new ConfigurationError({
        details: { scheduleId },
        message: `MFT schedule "${scheduleId}" is not registered`,
        retryable: false,
      });
    }

    return schedule;
  }

  /** Returns all schedules in registration order. */
  list(): MftSchedule[] {
    return Array.from(this.schedules.values());
  }

  /** Number of schedules currently registered. */
  get size(): number {
    return this.schedules.size;
  }
}
