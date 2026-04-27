import { describe, expect, it } from "vitest";
import {
  PathNotFoundError,
  createTransferClient,
  type CapabilitySet,
  type ConnectionProfile,
  type ProviderFactory,
  type RemoteStat,
  type TransferSession,
} from "../../src/index";

export interface ProviderContractOptions {
  createProviderFactory: () => ProviderFactory;
  profile: ConnectionProfile;
  listPath: string;
  expectedListPaths: readonly string[];
  statPath: string;
  expectedCapabilities?: Partial<CapabilitySet>;
  expectedStat?: Partial<RemoteStat>;
  missingPath: string;
}

export function describeProviderContract(
  providerName: string,
  options: ProviderContractOptions,
): void {
  describe(`${providerName} provider contract`, () => {
    it("connects through TransferClient and reports session capabilities", async () => {
      const { factory, session } = await connectSession(options);

      try {
        expect(session.provider).toBe(factory.id);
        expect(session.capabilities).toEqual(factory.capabilities);
        expect(session.capabilities).toMatchObject({
          list: true,
          provider: factory.id,
          stat: true,
          ...options.expectedCapabilities,
        });
      } finally {
        await session.disconnect();
      }
    });

    it("lists entries for advertised file-system support", async () => {
      const { session } = await connectSession(options);

      try {
        const entries = await session.fs.list(options.listPath);

        expect(entries.map((entry) => entry.path)).toEqual(options.expectedListPaths);
      } finally {
        await session.disconnect();
      }
    });

    it("stats entries for advertised metadata support", async () => {
      const { session } = await connectSession(options);

      try {
        await expect(session.fs.stat(options.statPath)).resolves.toMatchObject({
          exists: true,
          path: options.statPath,
          ...options.expectedStat,
        });
      } finally {
        await session.disconnect();
      }
    });

    it("raises typed missing-path errors", async () => {
      const { session } = await connectSession(options);

      try {
        await expect(session.fs.stat(options.missingPath)).rejects.toBeInstanceOf(
          PathNotFoundError,
        );
        await expect(session.fs.list(options.missingPath)).rejects.toBeInstanceOf(
          PathNotFoundError,
        );
      } finally {
        await session.disconnect();
      }
    });
  });
}

async function connectSession(options: ProviderContractOptions): Promise<{
  factory: ProviderFactory;
  session: TransferSession;
}> {
  const factory = options.createProviderFactory();
  const client = createTransferClient({ providers: [factory] });
  const session = await client.connect(options.profile);

  return { factory, session };
}
