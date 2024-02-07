import { it, expect } from 'vitest';
import { createPublicClient, http, zeroAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { nitroTestnodeL2 } from './chains';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';

import { getTestPrivateKeyAccount } from './testHelpers';

const deployer = getTestPrivateKeyAccount();

const publicClient = createPublicClient({
  chain: nitroTestnodeL2,
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
    async () =>
      await createRollupPrepareTransactionRequest({
        params: {
          config: createRollupPrepareConfig({
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
    async () =>
      await createRollupPrepareTransactionRequest({
        params: {
          config: createRollupPrepareConfig({
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
    async () =>
      await createRollupPrepareTransactionRequest({
        params: {
          config: createRollupPrepareConfig({
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
    async () =>
      await createRollupPrepareTransactionRequest({
        params: {
          config: createRollupPrepareConfig({
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
  const arbitrumSepoliaPublicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address, DataAvailabilityCommittee: true },
  });

  // prepare the transaction for deploying the core contracts
  await expect(
    async () =>
      await createRollupPrepareTransactionRequest({
        params: {
          config: createRollupPrepareConfig({
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
        publicClient: arbitrumSepoliaPublicClient,
      }),
  ).rejects.toThrowError(
    `"params.nativeToken" can only be configured with a token that uses 18 decimals.`,
  );
});
