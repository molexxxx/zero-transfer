/**
 * @file Declarative MFT route + cron schedule.
 *
 * Registers a route that copies an SFTP outbox into S3 every 15 minutes
 * via `MftScheduler`, observes results through the auditing hooks, and
 * shuts down gracefully on SIGINT.
 */
import {
  MftScheduler,
  RouteRegistry,
  ScheduleRegistry,
  createS3ProviderFactory,
  createSftpProviderFactory,
  createTransferClient,
  type MftRoute,
  type MftSchedule,
} from "@zero-transfer/sdk";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  await Promise.resolve();
  const client = createTransferClient({
    providers: [createSftpProviderFactory(), createS3ProviderFactory()],
  });

  const route: MftRoute = {
    description: "Mirror partner outbox into the analytics archive bucket.",
    destination: {
      path: "/incoming/partner-a/",
      profile: {
        host: "analytics-archive",
        password: { env: "AWS_SECRET_ACCESS_KEY" },
        provider: "s3",
        username: { env: "AWS_ACCESS_KEY_ID" },
      },
    },
    id: "partner-a-archive",
    name: "Partner A archive",
    operation: "copy",
    source: {
      path: "/outbox/",
      profile: {
        host: "sftp.partner-a.example.com",
        password: { env: "PARTNER_A_PASSWORD" },
        provider: "sftp",
        username: "molex",
      },
    },
  };

  const routes = new RouteRegistry();
  routes.register(route);

  const schedule: MftSchedule = {
    id: "partner-a-quarter-hour",
    routeId: route.id,
    trigger: { expression: "*/15 * * * *", kind: "cron", timezone: "utc" },
  };
  const schedules = new ScheduleRegistry();
  schedules.register(schedule);

  const scheduler = new MftScheduler({
    client,
    onError: ({ error, schedule: s }) =>
      console.error(`Schedule ${s.id} failed:`, (error as Error).message),
    onFire: ({ firedAt, schedule: s }) => console.log(`[${firedAt.toISOString()}] Firing ${s.id}`),
    onResult: ({ receipt, schedule: s }) =>
      console.log(`[${s.id}] copied ${receipt.bytesTransferred} bytes (${receipt.jobId})`),
    routes,
    schedules,
  });

  scheduler.start();
  process.on("SIGINT", () => {
    void scheduler.stop().then(() => process.exit(0));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
