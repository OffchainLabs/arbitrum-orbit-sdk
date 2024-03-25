import { describe, it, expect } from 'vitest';
import { Address, createPublicClient, http, parseGwei, zeroAddress } from 'viem';

import { nitroTestnodeL2 } from './chains';
import { getNitroTestnodePrivateKeyAccounts } from './testHelpers';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { generateChainId } from './utils';
import { createRollup } from './createRollup';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { prepareChainConfig } from './prepareChainConfig';

const parentChainPublicClient = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

// test inputs
const testnodeAccounts = getNitroTestnodePrivateKeyAccounts();
const userTokenBridgeDeployer = testnodeAccounts.userTokenBridgeDeployer;
const batchPoster = testnodeAccounts.deployer.address;
const validators = [testnodeAccounts.deployer.address];

async function createRollupHelper(nativeToken: Address = zeroAddress) {
  const chainId = generateChainId();

  const createRollupConfig = createRollupPrepareConfig({
    chainId: BigInt(chainId),
    owner: userTokenBridgeDeployer.address,
    chainConfig: prepareChainConfig({
      chainId,
      arbitrum: {
        InitialChainOwner: userTokenBridgeDeployer.address,
        DataAvailabilityCommittee: true,
      },
    }),
  });

  const createRollupInformation = await createRollup({
    config: createRollupConfig,
    rollupOwner: userTokenBridgeDeployer,
    batchPoster,
    validators,
    nativeToken,
    parentChainPublicClient,
  });

  // create test rollup with ETH as gas token
  return {
    createRollupConfig,
    createRollupInformation,
  };
}

describe(`createRollup`, () => {
  describe(`create an AnyTrust chain that uses ETH as gas token`, async () => {
    const { createRollupConfig, createRollupInformation } = await createRollupHelper();

    it(`successfully deploys core contracts through rollup creator`, async () => {
      // assert all inputs are correct
      const [arg] = createRollupInformation.transaction.getInputs();
      expect(arg.config).toEqual(createRollupConfig);
      expect(arg.batchPoster).toEqual(batchPoster);
      expect(arg.validators).toEqual(validators);
      expect(arg.maxDataSize).toEqual(104_857n);
      expect(arg.nativeToken).toEqual(zeroAddress);
      expect(arg.deployFactoriesToL2).toEqual(true);
      expect(arg.maxFeePerGasForRetryables).toEqual(parseGwei('0.1'));

      // assert the transaction executed successfully
      expect(createRollupInformation.transactionReceipt.status).toEqual('success');

      // assert the core contracts were successfully obtained
      expect(createRollupInformation.coreContracts).toBeDefined();
    });

    it(`finds the transaction hash that created a specified deployed rollup contract`, async () => {
      const transactionHash = await createRollupFetchTransactionHash({
        rollup: createRollupInformation.coreContracts.rollup,
        publicClient: parentChainPublicClient,
      });

      expect(transactionHash).toEqual(createRollupInformation.transactionReceipt.transactionHash);
    });
  });

  describe(`create an AnyTrust chain that uses a custom gas token`, async () => {
    // deployed during nitro testnode running process
    const customGasTokenAddress = '0xc57a290f65F1D433f081381B2A7A523Ea70f1134';

    const { createRollupConfig, createRollupInformation } = await createRollupHelper(
      customGasTokenAddress,
    );

    it(`successfully deploys core contracts through rollup creator`, async () => {
      // assert all inputs are correct
      const [arg] = createRollupInformation.transaction.getInputs();
      expect(arg.config).toEqual(createRollupConfig);
      expect(arg.batchPoster).toEqual(batchPoster);
      expect(arg.validators).toEqual(validators);
      expect(arg.maxDataSize).toEqual(104_857n);
      expect(arg.nativeToken).toEqual(customGasTokenAddress);
      expect(arg.deployFactoriesToL2).toEqual(true);
      expect(arg.maxFeePerGasForRetryables).toEqual(parseGwei('0.1'));

      // assert the transaction executed successfully
      expect(createRollupInformation.transactionReceipt.status).toEqual('success');

      // assert the core contracts were successfully obtained
      expect(createRollupInformation.coreContracts).toBeDefined();
    });

    it(`finds the transaction hash that created a specified deployed rollup contract`, async () => {
      const transactionHash = await createRollupFetchTransactionHash({
        rollup: createRollupInformation.coreContracts.rollup,
        publicClient: parentChainPublicClient,
      });

      expect(transactionHash).toEqual(createRollupInformation.transactionReceipt.transactionHash);
    });
  });
});
