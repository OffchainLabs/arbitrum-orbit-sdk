import { it, expect } from 'vitest';
import { createPublicClient, http, zeroAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareDeploymentParamsConfig } from './createRollupPrepareDeploymentParamsConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import { rollupCreator } from './contracts';

import { getNitroTestnodePrivateKeyAccounts } from './testHelpers';

const testnodeAccounts = getNitroTestnodePrivateKeyAccounts();
const deployer = testnodeAccounts.deployer;

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

it(`fails to prepare transaction request if "params.batchPoster" is set to the zero address`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  // prepare the transaction for deploying the core contracts
  await expect(
    createRollupPrepareTransactionRequest({
      params: {
        config: createRollupPrepareDeploymentParamsConfig(publicClient, {
          chainId: BigInt(chainId),
          owner: deployer.address,
          chainConfig,
        }),
        // set batch poster to the zero address
        batchPoster: zeroAddress,
        validators: [deployer.address],
      },
      account: deployer.address,
      publicClient,
    }),
  ).rejects.toThrowError(`"params.batchPoster" can't be set to the zero address.`);
});

it(`fails to prepare transaction request if "params.validators" is set to an empty array`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  // prepare the transaction for deploying the core contracts
  await expect(
    createRollupPrepareTransactionRequest({
      params: {
        config: createRollupPrepareDeploymentParamsConfig(publicClient, {
          chainId: BigInt(chainId),
          owner: deployer.address,
          chainConfig,
        }),
        batchPoster: deployer.address,
        // set validators to an empty array
        validators: [],
      },
      account: deployer.address,
      publicClient,
    }),
  ).rejects.toThrowError(`"params.validators" can't be empty or contain the zero address.`);
});

it(`fails to prepare transaction request if "params.validators" includes the zero address`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  // prepare the transaction for deploying the core contracts
  await expect(
    createRollupPrepareTransactionRequest({
      params: {
        config: createRollupPrepareDeploymentParamsConfig(publicClient, {
          chainId: BigInt(chainId),
          owner: deployer.address,
          chainConfig,
        }),
        batchPoster: deployer.address,
        // set validators to zero address
        validators: [zeroAddress],
      },
      account: deployer.address,
      publicClient,
    }),
  ).rejects.toThrowError(`"params.validators" can't be empty or contain the zero address.`);
});

it(`fails to prepare transaction request if "params.nativeToken" is custom and chain is not anytrust`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  // prepare the transaction for deploying the core contracts
  await expect(
    createRollupPrepareTransactionRequest({
      params: {
        config: createRollupPrepareDeploymentParamsConfig(publicClient, {
          chainId: BigInt(chainId),
          owner: deployer.address,
          chainConfig,
        }),
        batchPoster: deployer.address,
        validators: [deployer.address],
        // set native token to anything custom
        nativeToken: deployer.address,
      },
      account: deployer.address,
      publicClient,
    }),
  ).rejects.toThrowError(
    `"params.nativeToken" can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`,
  );
});

it(`fails to prepare transaction request if "params.nativeToken" doesn't use 18 decimals`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address, DataAvailabilityCommittee: true },
  });

  // prepare the transaction for deploying the core contracts
  await expect(
    createRollupPrepareTransactionRequest({
      params: {
        config: createRollupPrepareDeploymentParamsConfig(publicClient, {
          chainId: BigInt(chainId),
          owner: deployer.address,
          chainConfig,
        }),
        batchPoster: deployer.address,
        validators: [deployer.address],
        // USDC on Arbitrum Sepolia has 6 decimals
        nativeToken: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      },
      account: deployer.address,
      publicClient,
    }),
  ).rejects.toThrowError(
    `"params.nativeToken" can only be configured with a token that uses 18 decimals.`,
  );
});

it(`successfully prepares a transaction request with the default rollup creator and a gas limit override`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address, DataAvailabilityCommittee: true },
  });

  const txRequest = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareDeploymentParamsConfig(publicClient, {
        chainId: BigInt(chainId),
        owner: deployer.address,
        chainConfig,
      }),
      batchPoster: deployer.address,
      validators: [deployer.address],
    },
    account: deployer.address,
    publicClient,
    gasOverrides: { gasLimit: { base: 1_000n } },
  });

  expect(txRequest.account).toEqual(deployer.address);
  expect(txRequest.from).toEqual(deployer.address);
  expect(txRequest.to).toEqual(rollupCreator.address[arbitrumSepolia.id]);
  expect(txRequest.chainId).toEqual(arbitrumSepolia.id);
  expect(txRequest.gas).toEqual(1_000n);
});

it(`successfully prepares a transaction request with a custom rollup creator and a gas limit override`, async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address, DataAvailabilityCommittee: true },
  });

  const txRequest = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareDeploymentParamsConfig(publicClient, {
        chainId: BigInt(chainId),
        owner: deployer.address,
        chainConfig,
      }),
      batchPoster: deployer.address,
      validators: [deployer.address],
    },
    account: deployer.address,
    publicClient,
    gasOverrides: { gasLimit: { base: 1_000n, percentIncrease: 20n } },
    rollupCreatorAddressOverride: '0x31421C442c422BD16aef6ae44D3b11F404eeaBd9',
  });

  expect(txRequest.account).toEqual(deployer.address);
  expect(txRequest.from).toEqual(deployer.address);
  expect(txRequest.to).toEqual('0x31421C442c422BD16aef6ae44D3b11F404eeaBd9');
  expect(txRequest.chainId).toEqual(arbitrumSepolia.id);
  expect(txRequest.gas).toEqual(1_200n);
});
