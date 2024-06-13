import { expect, it } from 'vitest';

import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';

const chainId = 69_420n;
const vitalik: `0x${string}` = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

it('creates config with defaults', () => {
  expect(
    createRollupPrepareConfig({
      owner: vitalik,
      chainId,
    }),
  ).toMatchSnapshot();
});

it('creates config with overrides', () => {
  expect(
    createRollupPrepareConfig({
      owner: vitalik,
      chainId,
      chainConfig: prepareChainConfig({
        chainId: 69_420,
        arbitrum: {
          InitialChainOwner: vitalik,
          InitialArbOSVersion: 30,
          DataAvailabilityCommittee: true,
        },
      }),
      confirmPeriodBlocks: 4200n,
      extraChallengeTimeBlocks: 5n,
      loserStakeEscrow: '0x0000000000000000000000000000000000000001',
      sequencerInboxMaxTimeVariation: {
        delayBlocks: 200n,
        delaySeconds: 5n,
        futureBlocks: 100n,
        futureSeconds: 1n,
      },
      stakeToken: '0x0000000000000000000000000000000000000002',
      wasmModuleRoot: '0xWasmModuleRoot',
    }),
  ).toMatchSnapshot();
});
