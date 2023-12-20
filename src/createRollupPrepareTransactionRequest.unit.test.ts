import { it, expect } from 'vitest';
import { createPublicClient, http, parseGwei, zeroAddress } from 'viem';

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

it(`fails to prepare transaction request if "batchPoster" is set to the zero address`, async () => {
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
      })
  ).rejects.toThrowError(
    `Param "batchPoster" can't be set to the zero address.`
  );
});

it(`fails to prepare transaction request if "validators" is set to an empty array`, async () => {
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
      })
  ).rejects.toThrowError(
    `Param "validators" can't be empty or contain the zero address.`
  );
});

it(`fails to prepare transaction request if "validators" includes the zero address`, async () => {
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
      })
  ).rejects.toThrowError(
    `Param "validators" can't be empty or contain the zero address.`
  );
});

it(`fails to prepare transaction request if "nativeToken" is custom and chain is not anytrust`, async () => {
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
      })
  ).rejects.toThrowError(
    `Param "nativeToken" can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`
  );
});
