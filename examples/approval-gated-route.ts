/**
 * @file Approval gate for sensitive scheduled routes.
 *
 * Demonstrates wiring `ApprovalRegistry` + `createApprovalGate` into an
 * `MftScheduler` so a human reviewer must approve each fire before the
 * route actually runs. This pattern is suitable for production releases,
 * compliance-gated MFT flows, and "two-person rule" deployments.
 */
import {
  ApprovalRegistry,
  ApprovalRejectedError,
  MftScheduler,
  RouteRegistry,
  ScheduleRegistry,
  createApprovalGate,
  createSftpProviderFactory,
  createTransferClient,
  runRoute,
  type MftRoute,
  type MftSchedule,
} from "@zero-transfer/sdk";

import { fileURLToPath } from "node:url";
async function main(): Promise<void> {
  await Promise.resolve();
  const client = createTransferClient({ providers: [createSftpProviderFactory()] });

  const route: MftRoute = {
    description: "Push tonight's production payroll batch to the partner SFTP.",
    destination: {
      path: "/payroll/incoming/",
      profile: {
        host: "sftp.partner.example.com",
        password: { env: "PARTNER_PASSWORD" },
        provider: "sftp",
        username: "molex",
      },
    },
    id: "payroll-export",
    name: "Payroll export",
    operation: "upload",
    source: {
      path: "/var/exports/payroll/",
      profile: {
        host: "sftp.internal.example.com",
        password: { env: "INTERNAL_PASSWORD" },
        provider: "sftp",
        username: "exporter",
      },
    },
  };

  const routes = new RouteRegistry([route]);
  const schedules = new ScheduleRegistry();
  const schedule: MftSchedule = {
    id: "payroll-nightly",
    routeId: route.id,
    trigger: { expression: "0 2 * * *", kind: "cron", timezone: "utc" },
  };
  schedules.register(schedule);

  const approvals = new ApprovalRegistry();
  let approvalCounter = 0;

  const gatedRunner = createApprovalGate({
    approvalId: () => `payroll-${(approvalCounter += 1)}-${Date.now()}`,
    registry: approvals,
    runner: ({ client: c, route: r, signal }) => runRoute({ client: c, route: r, signal }),
  });

  const scheduler = new MftScheduler({
    client,
    onError: ({ error, schedule: s }) => {
      if (error instanceof ApprovalRejectedError) {
        console.warn(`Approval rejected for ${s.id}: ${error.message}`);
      } else {
        console.error(`Schedule ${s.id} failed:`, (error as Error).message);
      }
    },
    onFire: ({ schedule: s }) => console.log(`[${s.id}] awaiting approval...`),
    onResult: ({ receipt }) => console.log(`Released after approval: ${receipt.jobId}`),
    routes,
    runner: gatedRunner,
    schedules,
  });

  scheduler.start();

  // Simulate an external reviewer approving every pending request after a short delay.
  setInterval(() => {
    for (const pending of approvals.listPending()) {
      console.log(`Auto-approving ${pending.id}`);
      approvals.approve(pending.id, { reason: "Auto-approved by demo", resolvedBy: "ops-bot" });
    }
  }, 5_000);

  process.on("SIGINT", () => {
    void scheduler.stop().then(() => process.exit(0));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { main };
