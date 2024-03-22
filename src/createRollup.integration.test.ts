import { describe, it, expect } from 'vitest';
import { createPublicClient, http, parseGwei, zeroAddress } from 'viem';

import { nitroTestnodeL2 } from './chains';
import { getNitroTestnodePrivateKeyAccounts } from './testHelpers';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { generateChainId } from './utils';
import { createRollup } from './createRollup';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { prepareChainConfig } from './prepareChainConfig';

// public client
const publicClient = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

// test inputs
const testnodeAccounts = getNitroTestnodePrivateKeyAccounts();
const deployer = testnodeAccounts.deployer;
const batchPoster = testnodeAccounts.deployer.address;
const validators = [testnodeAccounts.deployer.address];

describe(`createRollup`, async () => {
  const chainId = generateChainId();

  const createRollupConfig = createRollupPrepareConfig({
    chainId: BigInt(chainId),
    owner: deployer.address,
    chainConfig: prepareChainConfig({
      chainId,
      arbitrum: {
        InitialChainOwner: deployer.address,
        DataAvailabilityCommittee: true,
      },
    }),
  });

  // create test rollup
  const createRollupInformation = await createRollup({
    config: createRollupConfig,
    rollupOwner: deployer,
    batchPoster,
    validators,
    parentChainPublicClient: publicClient,
  });

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

  it('finds the transaction hash that created a specified deployed rollup contract', async () => {
    const transactionHash = await createRollupFetchTransactionHash({
      rollup: createRollupInformation.coreContracts.rollup,
      publicClient,
    });

    expect(transactionHash).toEqual(createRollupInformation.transactionReceipt.transactionHash);
  });
});
