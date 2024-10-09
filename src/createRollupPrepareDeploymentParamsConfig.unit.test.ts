import { it, expect } from 'vitest';
import { Address, createPublicClient, http } from 'viem';

import {
  arbitrumOne,
  arbitrumSepolia,
  base,
  baseSepolia,
  registerCustomParentChain,
} from './chains';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareDeploymentParamsConfig } from './createRollupPrepareDeploymentParamsConfig';
import { createExampleCustomParentChain } from './customChainsTestHelpers';

const chainId = 69_420n;
const vitalik: `0x${string}` = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

function getOverrides({ owner, chainId }: { owner: Address; chainId: bigint }) {
  return {
    owner,
    chainId,
    chainConfig: prepareChainConfig({
      chainId: Number(chainId),
      arbitrum: {
        InitialChainOwner: owner,
        InitialArbOSVersion: 20,
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
  } as const;
}

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
    createRollupPrepareDeploymentParamsConfig(
      arbitrumOneClient,
      getOverrides({ owner: vitalik, chainId }),
    ),
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
    createRollupPrepareDeploymentParamsConfig(
      arbitrumSepoliaClient,
      getOverrides({ owner: vitalik, chainId }),
    ),
  ).toMatchSnapshot();
});

it('creates config for a chain on top of base with defaults', () => {
  const baseClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  expect(
    createRollupPrepareDeploymentParamsConfig(baseClient, {
      owner: vitalik,
      chainId,
    }),
  ).toMatchSnapshot();
});

it('creates config for a chain on top of base sepolia with defaults', () => {
  const baseSepoliaClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  expect(
    createRollupPrepareDeploymentParamsConfig(baseSepoliaClient, {
      owner: vitalik,
      chainId,
    }),
  ).toMatchSnapshot();
});

it('fails to create a config for a chain on top of a custom parent chain if "confirmPeriodBlocks" is not provided', () => {
  const chain = createExampleCustomParentChain({
    id: 123,
  });

  const publicClient = createPublicClient({
    chain,
    transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
  });

  registerCustomParentChain(chain);

  expect(() =>
    createRollupPrepareDeploymentParamsConfig(publicClient, {
      owner: vitalik,
      chainId: BigInt(chain.id),
    }),
  ).toThrowError('"params.confirmPeriodBlocks" must be provided when using a custom parent chain');
});

it('fails to create a config for a chain on top of a custom parent chain if "sequencerInboxMaxTimeVariation" is not provided', () => {
  const chain = createExampleCustomParentChain({
    id: 123,
  });

  const publicClient = createPublicClient({
    chain,
    transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
  });

  registerCustomParentChain(chain);

  expect(() =>
    createRollupPrepareDeploymentParamsConfig(publicClient, {
      owner: vitalik,
      chainId: BigInt(chain.id),
      confirmPeriodBlocks: 1n,
    }),
  ).toThrowError(
    '"params.sequencerInboxMaxTimeVariation" must be provided when using a custom parent chain.',
  );
});

it('creates a config for a chain on top of a custom parent chain', () => {
  const chain = createExampleCustomParentChain({
    id: 123,
  });

  const publicClient = createPublicClient({
    chain,
    transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
  });

  registerCustomParentChain(chain);

  expect(
    createRollupPrepareDeploymentParamsConfig(publicClient, {
      owner: vitalik,
      chainId: BigInt(chain.id),
      confirmPeriodBlocks: 1n,
      sequencerInboxMaxTimeVariation: {
        delayBlocks: 2n,
        futureBlocks: 3n,
        delaySeconds: 4n,
        futureSeconds: 5n,
      },
    }),
  ).toMatchSnapshot();
});
