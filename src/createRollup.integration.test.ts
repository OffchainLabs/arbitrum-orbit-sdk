import { describe, it, expect, beforeAll } from 'vitest';
import { Address, createPublicClient, http, parseGwei, zeroAddress } from 'viem';
import { TestERC20__factory } from '@arbitrum/sdk/dist/lib/abi/factories/TestERC20__factory';
import { Wallet } from 'ethers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

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
const deployer = testnodeAccounts.deployer;
const batchPoster = testnodeAccounts.deployer.address;
const validators = [testnodeAccounts.deployer.address];

async function createRollupHelper(nativeToken: Address = zeroAddress) {
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

  const createRollupInformation = await createRollup({
    config: createRollupConfig,
    rollupOwner: deployer,
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

/**
 * @todo use viem instead of ethers when Arbitrum SDK supports viem
 */
async function deployERC20ToParentChain() {
  console.log('Deploying ERC20 to Parent Chain...');

  const parentChainProvider = new StaticJsonRpcProvider(
    parentChainPublicClient.chain.rpcUrls.default.http[0],
  );
  const localWallet = new Wallet(deployer.privateKey);
  const contract = new TestERC20__factory().connect(localWallet.connect(parentChainProvider));
  const token = await contract.deploy();
  await token.deployed();

  const mintedL1Erc20Token = await token.mint();
  await mintedL1Erc20Token.wait();

  return token;
}

describe(`createRollup`, () => {
  let customGasTokenAddress: Address = zeroAddress;

  beforeAll(async () => {
    customGasTokenAddress = (await deployERC20ToParentChain()).address as Address;
  });

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
});
