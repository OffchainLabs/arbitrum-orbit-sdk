import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { arbitrumOne, arbitrumSepolia } from './chains';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareDeploymentParamsConfig } from './createRollupPrepareDeploymentParamsConfig';

const chainId = 69_420n;
const vitalik: `0x${string}` = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

it('creates config for a chain on top of arbitrum one with defaults', () => {
  const arbitrumOneClient = createPublicClient({
    chain: arbitrumOne,
    transport: http(),
  });

  expect(
    createRollupPrepareDeploymentParamsConfig(arbitrumOneClient, {
      owner: vitalik,
      chainId,
    }),
  ).toMatchSnapshot();
});

it('creates config for a chain on top of arbitrum one with overrides', () => {
  const arbitrumOneClient = createPublicClient({
    chain: arbitrumOne,
    transport: http(),
  });

  expect(
    createRollupPrepareDeploymentParamsConfig(arbitrumOneClient, {
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

it('creates config for a chain on top of arbitrum sepolia with defaults', () => {
  const arbitrumSepoliaClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  expect(
    createRollupPrepareDeploymentParamsConfig(arbitrumSepoliaClient, {
      owner: vitalik,
      chainId,
    }),
  ).toMatchSnapshot();
});

it('creates config for a chain on top of arbitrum sepolia with overrides', () => {
  const arbitrumSepoliaClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  expect(
    createRollupPrepareDeploymentParamsConfig(arbitrumSepoliaClient, {
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