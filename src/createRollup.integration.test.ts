import { describe, it, expect } from 'vitest';
import { Address, createPublicClient, http, parseGwei, zeroAddress } from 'viem';

import { nitroTestnodeL2 } from './chains';
import { getNitroTestnodePrivateKeyAccounts, createRollupHelper } from './testHelpers';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';

const parentChainPublicClient = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

// test inputs
const testnodeAccounts = getNitroTestnodePrivateKeyAccounts();
const l3TokenBridgeDeployer = testnodeAccounts.l3TokenBridgeDeployer;
const batchPoster = testnodeAccounts.deployer.address;
const validators: [Address] = [testnodeAccounts.deployer.address];

describe(`create an AnyTrust chain that uses ETH as gas token`, async () => {
  const { createRollupConfig, createRollupInformation } = await createRollupHelper({
    deployer: l3TokenBridgeDeployer,
    batchPoster,
    validators,
    nativeToken: zeroAddress,
    client: parentChainPublicClient,
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

  const { createRollupConfig, createRollupInformation } = await createRollupHelper({
    deployer: l3TokenBridgeDeployer,
    batchPoster,
    validators,
    nativeToken: customGasTokenAddress,
    client: parentChainPublicClient,
  });

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
