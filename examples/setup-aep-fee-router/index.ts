import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseAbi,
  getAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  feeRouterDeployChildToParentRewardRouter,
  feeRouterDeployRewardDistributor,
  createRollupFetchCoreContracts,
  createTokenBridgeFetchTokenBridgeContracts,
  arbOwnerPublicActions,
  arbGasInfoPublicActions,
  ParentChain,
} from '@arbitrum/orbit-sdk';
import {
  sanitizePrivateKey,
  getParentChainLayer,
  getParentChainFromId,
} from '@arbitrum/orbit-sdk/utils';
import { config } from 'dotenv';
import { ParentChainPublicClient } from '@arbitrum/orbit-sdk/types/ParentChain';
config();

// environent variables check
if (
  typeof process.env.ROLLUP_ADDRESS === 'undefined' ||
  typeof process.env.CHAIN_OWNER_PRIVATE_KEY === 'undefined' ||
  typeof process.env.ORBIT_CHAIN_ID === 'undefined' ||
  typeof process.env.ORBIT_CHAIN_RPC === 'undefined' ||
  typeof process.env.PARENT_CHAIN_ID === 'undefined' ||
  typeof process.env.PARENT_CHAIN_TARGET_ADDRESS === 'undefined'
) {
  throw new Error(
    `Please provide the following environment variables: ROLLUP_ADDRESS, CHAIN_OWNER_PRIVATE_KEY, ORBIT_CHAIN_ID, ORBIT_CHAIN_RPC, PARENT_CHAIN_ID, PARENT_CHAIN_TARGET_ADDRESS.`,
  );
}

// load the chain owner account (or any account that has the executor role in the UpgradeExecutor)
const chainOwner = privateKeyToAccount(sanitizePrivateKey(process.env.CHAIN_OWNER_PRIVATE_KEY));

// set the parent chain and create a public client for it
const parentChain = getParentChainFromId(Number(process.env.PARENT_CHAIN_ID));
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

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
const orbitChainPublicClient = createPublicClient({ chain: orbitChain, transport: http() })
  .extend(arbOwnerPublicActions)
  .extend(arbGasInfoPublicActions);
const orbitChainWalletClient = createWalletClient({
  chain: orbitChain,
  transport: http(),
  account: chainOwner,
});

// Parent chain target address. It will receive 10% of the chain revenue on L1.
const parentChainTargetAddress = getAddress(process.env.PARENT_CHAIN_TARGET_ADDRESS);

async function main() {
  // Verify that this is an L2 orbit chain
  if (getParentChainLayer(parentChainPublicClient.chain.id) !== 1) {
    throw new Error(
      'This script is intended to be used only by L2 Orbit chains settling to Ethereum.',
    );
  }

  // Step 0. Collect information
  // (We need to obtain all chain contracts and the current fee collectors of all fee types)
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

  // getting Orbit base fee collector (infraFeeAccount)
  const infraFeeAccount = await orbitChainPublicClient.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  // getting Orbit surplus fee collector (networkFeeAccount)
  const networkFeeAccount = await orbitChainPublicClient.arbOwnerReadContract({
    functionName: 'getNetworkFeeAccount',
  });

  // getting parent chain surplus fee collector (L1RewardRecipient)
  // Note: Arbiscan (Sepolia) doesn't have the updated ABI for ArbGasInfo, so we need to
  // fetch the reward recipient this way
  const parentChainRewardRecipient = await orbitChainPublicClient.readContract({
    address: '0x000000000000000000000000000000000000006C',
    abi: parseAbi(['function getL1RewardRecipient() view returns (address)']),
    functionName: 'getL1RewardRecipient',
  });

  // Step 1. Deploy the ChildToParentRouter
  // (This contract will transfer the amounts received by the contract to a specific address in the parent chain)
  // --------------------------------------
  console.log('Deploying contract ChildToParentRouter...');
  const childToParentRouterDeploymentTransactionHash =
    await feeRouterDeployChildToParentRewardRouter({
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

  // Step 2. Deploy a RewardDistributor for each distinct fee collector
  //
  // These contracts will distribute the amounts received by them to the configured recipients
  // Each contract will have the following recipients configured:
  //  - Previous fee collector, to receive 90% of the amount
  //  - Deployed childToParentRouter, to receive 10% of the amount
  // ------------------------------------
  const feeCollectors = [
    ...new Set([infraFeeAccount, networkFeeAccount, parentChainRewardRecipient]),
  ];
  const feeCollectorToRewardDistributor: { [key: `0x${string}`]: `0x${string}` } = {};

  for await (const feeCollector of feeCollectors) {
    const recipients = [
      {
        account: feeCollector,
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

    feeCollectorToRewardDistributor[feeCollector] = rewardDistributorAddress;
  }

  // Step 3. Set the fee collectors to the new RewardDistributor contracts
  // -----------------------------------------------------------------------------
  console.log('Setting the RewardDistributors as the fee new collectors...');

  // setting Orbit base fee collector (infraFeeAccount)
  const setOrbitBaseFeeCollectorTransactionRequest =
    await orbitChainPublicClient.arbOwnerPrepareTransactionRequest({
      functionName: 'setInfraFeeAccount',
      args: [feeCollectorToRewardDistributor[infraFeeAccount]],
      upgradeExecutor: tokenBridgeContracts.orbitChainContracts.upgradeExecutor,
      account: chainOwner.address,
    });
  await orbitChainPublicClient.sendRawTransaction({
    serializedTransaction: await chainOwner.signTransaction(
      setOrbitBaseFeeCollectorTransactionRequest,
    ),
  });

  // setting Orbit surplus fee collector (networkFeeAccount)
  const setOrbitSurplusFeeCollectorTransactionRequest =
    await orbitChainPublicClient.arbOwnerPrepareTransactionRequest({
      functionName: 'setNetworkFeeAccount',
      args: [feeCollectorToRewardDistributor[networkFeeAccount]],
      upgradeExecutor: tokenBridgeContracts.orbitChainContracts.upgradeExecutor,
      account: chainOwner.address,
    });
  await orbitChainPublicClient.sendRawTransaction({
    serializedTransaction: await chainOwner.signTransaction(
      setOrbitSurplusFeeCollectorTransactionRequest,
    ),
  });

  // setting parent chain surplus fee collector (L1RewardRecipient)
  const setParentChainSurplusFeeCollectorTransactionRequest =
    await orbitChainPublicClient.arbOwnerPrepareTransactionRequest({
      functionName: 'setL1PricingRewardRecipient',
      args: [feeCollectorToRewardDistributor[parentChainRewardRecipient]],
      upgradeExecutor: tokenBridgeContracts.orbitChainContracts.upgradeExecutor,
      account: chainOwner.address,
    });
  await orbitChainPublicClient.sendRawTransaction({
    serializedTransaction: await chainOwner.signTransaction(
      setParentChainSurplusFeeCollectorTransactionRequest,
    ),
  });

  // checking that the fee collectors were correctly set
  const currentInfraFeeAccount = await orbitChainPublicClient.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });
  if (currentInfraFeeAccount != feeCollectorToRewardDistributor[infraFeeAccount]) {
    throw new Error(
      `Orbit base fee collector was not correctly set. It is now set to ${currentInfraFeeAccount}`,
    );
  }
  console.log(
    `Orbit base fee collector correctly set to the RewardDistributor contract ${currentInfraFeeAccount}`,
  );

  const currentNetworkFeeAccount = await orbitChainPublicClient.arbOwnerReadContract({
    functionName: 'getNetworkFeeAccount',
  });
  if (currentNetworkFeeAccount != feeCollectorToRewardDistributor[networkFeeAccount]) {
    throw new Error(
      `Orbit surplus fee collector was not correctly set. It is now set to ${currentNetworkFeeAccount}`,
    );
  }
  console.log(
    `Orbit surplus fee collector correctly set to the RewardDistributor contract ${currentNetworkFeeAccount}`,
  );

  const currentParentChainRewardRecipient = await orbitChainPublicClient.readContract({
    address: '0x000000000000000000000000000000000000006C',
    abi: parseAbi(['function getL1RewardRecipient() view returns (address)']),
    functionName: 'getL1RewardRecipient',
  });
  if (
    currentParentChainRewardRecipient != feeCollectorToRewardDistributor[parentChainRewardRecipient]
  ) {
    throw new Error(
      `Parent chain surplus fee collector was not correctly set. It is now set to ${currentParentChainRewardRecipient}`,
    );
  }
  console.log(
    `Parent chain surplus fee collector correctly set to the RewardDistributor contract ${currentParentChainRewardRecipient}`,
  );
}

main();
