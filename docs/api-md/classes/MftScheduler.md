[**ZeroTransfer SDK v0.4.4**](../README.md)

***

[ZeroTransfer SDK](../README.md) / MftScheduler

# Class: MftScheduler

Defined in: [src/mft/MftScheduler.ts:106](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftScheduler.ts#L106)

Runs routes on configured schedules.

Subscribes to a [ScheduleRegistry](ScheduleRegistry.md), computes the next fire time for
each schedule (cron or interval), and dispatches the matching route through
a runner of your choice (`runRoute` by default, or a wrapped runner for
approvals / rate limiting / circuit breaking). Observers fire on each cycle
for telemetry. Tests can inject a deterministic timer via `timer`.

## Example

```ts
import {
  ApprovalRegistry,
  InMemoryAuditLog,
  MftScheduler,
  RouteRegistry,
  ScheduleRegistry,
  createApprovalGate,
  runRoute,
} from "@zero-transfer/sdk";

const audit = new InMemoryAuditLog();
const approvals = new ApprovalRegistry();

const scheduler = new MftScheduler({
  client,
  routes: new RouteRegistry([route]),
  schedules: new ScheduleRegistry([
    { id: "nightly", routeId: route.id, cron: "0 2 * * *" },
  ]),
  runner: createApprovalGate({
    registry: approvals,
    approvalId: ({ route }) => `release:${route.id}`,
    runner: ({ client: c, route: r, signal }) => runRoute({ client: c, route: r, signal }),
  }),
  onResult: ({ receipt }) => audit.record({ type: "transfer.success", receipt }),
  onError:  ({ error })   => audit.record({ type: "transfer.failure", error }),
});

scheduler.start();
```

## Accessors

### isRunning

#### Get Signature

```ts
get isRunning(): boolean;
```

Defined in: [src/mft/MftScheduler.ts:132](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftScheduler.ts#L132)

Whether the scheduler is currently running.

##### Returns

`boolean`

## Constructors

### Constructor

```ts
new MftScheduler(options): MftScheduler;
```

Defined in: [src/mft/MftScheduler.ts:121](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftScheduler.ts#L121)

Creates a scheduler bound to a transfer client and registries.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`MftSchedulerOptions`](../interfaces/MftSchedulerOptions.md) | Client, registries, optional runner, observers, and timer hooks. |

#### Returns

`MftScheduler`

## Methods

### start()

```ts
start(): void;
```

Defined in: [src/mft/MftScheduler.ts:137](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftScheduler.ts#L137)

Starts the scheduler. No-op when already running.

#### Returns

`void`

***

### stop()

```ts
stop(): Promise<void>;
```

Defined in: [src/mft/MftScheduler.ts:152](https://github.com/tonywied17/zero-transfer/blob/68dfa4400774749583a618e74b7d5b51047394be/src/mft/MftScheduler.ts#L152)

Stops the scheduler and aborts in-flight route executions.

#### Returns

`Promise`\<`void`\>

A promise that resolves once all in-flight fires have settled.
