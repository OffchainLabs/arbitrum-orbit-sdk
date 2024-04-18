import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseAbi,
  getAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import {
  feeRouterDeployChildToParentRouter,
  feeRouterDeployRewardDistributor,
  arbAggregatorActions,
  createRollupFetchCoreContracts,
  createTokenBridgeFetchTokenBridgeContracts,
} from '@arbitrum/orbit-sdk';
import { sanitizePrivateKey, getParentChainLayer } from '@arbitrum/orbit-sdk/utils';
import { config } from 'dotenv';
config();

// environent variables check
if (typeof process.env.ROLLUP_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_ADDRESS" environment variable`);
}

if (typeof process.env.CHAIN_OWNER_PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "CHAIN_OWNER_PRIVATE_KEY" environment variable`);
}

if (typeof process.env.ORBIT_CHAIN_ID === 'undefined') {
  throw new Error(`Please provide the "ORBIT_CHAIN_ID" environment variable`);
}

if (typeof process.env.ORBIT_CHAIN_RPC === 'undefined') {
  throw new Error(`Please provide the "ORBIT_CHAIN_RPC" environment variable`);
}

// load the chain owner account (or any account that has the executor role in the UpgradeExecutor)
const chainOwner = privateKeyToAccount(sanitizePrivateKey(process.env.CHAIN_OWNER_PRIVATE_KEY));

// set the parent chain and create a public client for it
const parentChain = arbitrumSepolia;
const parentChainPublicClient = createPublicClient({ chain: parentChain, transport: http() });

// define chain config for the orbit chain
const orbitChain = defineChain({
  id: Number(process.env.ORBIT_CHAIN_ID),
  network: 'Orbit chain',
  name: 'orbit',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.ORBIT_CHAIN_RPC],
    },
    public: {
      http: [process.env.ORBIT_CHAIN_RPC],
    },
  },
  testnet: true,
});
const orbitChainPublicClient = createPublicClient({ chain: orbitChain, transport: http() }).extend(
  arbAggregatorActions,
);
const orbitChainWalletClient = createWalletClient({
  chain: orbitChain,
  transport: http(),
  account: chainOwner,
});

// Arbitrum Foundation multisig account on Ethereum
// https://etherscan.io/address/0x1Afa41C006dA1605846271E7bdae942F2787f941
const parentChainTargetAddress = getAddress('0x1Afa41C006dA1605846271E7bdae942F2787f941');

async function main() {
  // Verify that this is an L2 orbit chain
  if (getParentChainLayer(parentChainPublicClient.chain.id) !== 1) {
    throw new Error(
      'This script is intended to be used only by L2 Orbit chains settling to Ethereum.',
    );
  }

  // Step 0. Collect information
  // (We need to obtain all chain contracts and the current fee collector for the configured batch poster)
  // ---------------------------

  // getting all chain contracts
  const rollupCoreContracts = await createRollupFetchCoreContracts({
    rollup: process.env.ROLLUP_ADDRESS as `0x${string}`,
    publicClient: parentChainPublicClient,
  });

  const inbox = await parentChainPublicClient.readContract({
    address: rollupCoreContracts.rollup,
    abi: parseAbi(['function inbox() view returns (address)']),
    functionName: 'inbox',
  });
  const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
    inbox,
    parentChainPublicClient,
  });

  // getting the current batch poster
  console.log('Finding current batch poster...');
  const batchPosters = await orbitChainPublicClient.arbAggregatorReadContract({
    functionName: 'getBatchPosters',
  });

  let currentBatchPoster = '';
  for await (const batchPoster of batchPosters) {
    const isBatchPoster = await parentChainPublicClient.readContract({
      address: rollupCoreContracts.sequencerInbox,
      abi: parseAbi(['function isBatchPoster(address) view returns (bool)']),
      functionName: 'isBatchPoster',
      args: [batchPoster],
    });

    if (isBatchPoster) {
      currentBatchPoster = batchPoster;
    }
  }

  if (currentBatchPoster === '') {
    throw new Error('Current batch poster could not be found');
  }
  console.log(`Current batch poster is ${currentBatchPoster}`);

  // getting the fee collector of that batch poster
  const batchPosterFeeCollector = await orbitChainPublicClient.arbAggregatorReadContract({
    functionName: 'getFeeCollector',
    args: [currentBatchPoster as `0x${string}`],
  });
  console.log(`Fee collector for the current batch poster is ${batchPosterFeeCollector}`);
  console.log('');

  // Step 1. Deploy the ChildToParentRouter
  // (This contract will transfer the amounts received by the contract to a specific address in the parent chain)
  // ---------------------------------------
  console.log('Deploying contract ChildToParentRouter...');
  const childToParentRouterDeploymentTransactionHash = await feeRouterDeployChildToParentRouter({
    parentChainPublicClient,
    orbitChainWalletClient,
    parentChainTargetAddress,
  });

  const childToParentRouterDeploymentTransactionReceipt =
    await orbitChainPublicClient.waitForTransactionReceipt({
      hash: childToParentRouterDeploymentTransactionHash,
    });

  if (!childToParentRouterDeploymentTransactionReceipt.contractAddress) {
    throw new Error('ChildToParentRouter was not successfully deployed.');
  }

  const childToParentRouterAddress = getAddress(
    childToParentRouterDeploymentTransactionReceipt.contractAddress,
  );
  console.log(`ChildToParentRouter contract deployed at ${childToParentRouterAddress}`);
  console.log('');

  // 2. Deploy the RewardDistributor
  // (This contract will distribute the amounts received by the contract to the configured recipients)
  // -------------------------------
  const recipients = [
    {
      account: batchPosterFeeCollector,
      weight: 9000n,
    },
    {
      account: childToParentRouterAddress,
      weight: 1000n,
    },
  ];
  console.log('Deploying RewardDistributor contract...');
  const rewardDistributorDeploymentTransactionHash = await feeRouterDeployRewardDistributor({
    orbitChainWalletClient,
    recipients,
  });

  const rewardDistributorDeploymentTransactionReceipt =
    await orbitChainPublicClient.waitForTransactionReceipt({
      hash: rewardDistributorDeploymentTransactionHash,
    });

  if (!rewardDistributorDeploymentTransactionReceipt.contractAddress) {
    throw new Error('RewardDistributor was not successfully deployed.');
  }

  const rewardDistributorAddress = getAddress(
    rewardDistributorDeploymentTransactionReceipt.contractAddress,
  );
  console.log(`RewardDistributor contract deployed at ${rewardDistributorAddress}`);
  console.log('');

  // 3. Set FeeCollector of the current batch poster to the RewardDistributor
  // ------------------------------------------------------------------------
  console.log('Setting the RewardDistributo as the FeeCollector of the active batch poster...');
  const setFeeCollectorTransactionRequest =
    await orbitChainPublicClient.arbAggregatorPrepareTransactionRequest({
      functionName: 'setFeeCollector',
      args: [currentBatchPoster as `0x${string}`, rewardDistributorAddress],
      upgradeExecutor: tokenBridgeContracts.orbitChainContracts.upgradeExecutor,
      account: chainOwner.address,
    });

  await orbitChainPublicClient.sendRawTransaction({
    serializedTransaction: await chainOwner.signTransaction(setFeeCollectorTransactionRequest),
  });

  // checking that the fee collector was correctly set
  const currentFeeCollector = await orbitChainPublicClient.arbAggregatorReadContract({
    functionName: 'getFeeCollector',
    args: [currentBatchPoster as `0x${string}`],
  });
  if (currentFeeCollector != rewardDistributorAddress) {
    throw new Error(`Fee collector was not correctly set. It is now set to ${currentFeeCollector}`);
  }
  console.log('Fee collector correctly set to the RewardDistributor contract');
}

main();
