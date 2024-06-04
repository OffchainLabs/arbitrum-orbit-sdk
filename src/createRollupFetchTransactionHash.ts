import { Address, PublicClient } from 'viem';
import { AbiEvent } from 'abitype';

import { validateParentChain } from './types/ParentChain';
import {
  mainnet,
  arbitrumOne,
  arbitrumNova,
  base,
  sepolia,
  holesky,
  arbitrumSepolia,
  baseSepolia,
  nitroTestnodeL1,
  nitroTestnodeL2,
} from './chains';

export type CreateRollupFetchTransactionHashParams = {
  rollup: Address;
  publicClient: PublicClient;
};

const RollupInitializedEventAbi: AbiEvent = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: 'bytes32',
      name: 'machineHash',
      type: 'bytes32',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'chainId',
      type: 'uint256',
    },
  ],
  name: 'RollupInitialized',
  type: 'event',
};

const earliestRollupCreatorDeploymentBlockNumber = {
  // mainnet L1
  [mainnet.id]: 18736164n,
  // mainnet L2
  [arbitrumOne.id]: 150599584n,
  [arbitrumNova.id]: 47798739n,
  [base.id]: 12978604n,
  // testnet L1
  [sepolia.id]: 4741823n,
  [holesky.id]: 1118493n,
  // testnet L2
  [arbitrumSepolia.id]: 654628n,
  [baseSepolia.id]: 10606961n,
  // local nitro-testnode
  [nitroTestnodeL1.id]: 0n,
  [nitroTestnodeL2.id]: 0n,
};

/**
 * createRollupFetchTransactionHash retrieves the transaction hash of the
 * RollupInitialized event emitted by a specified Rollup contract on a given
 * public chain. It takes in the Rollup contract address and a PublicClient
 * instance as parameters, validates the parent chain, and fetches the event
 * logs to find the RollupInitialized event. The function then returns the
 * transaction hash associated with that event.
 */
export async function createRollupFetchTransactionHash({
  rollup,
  publicClient,
}: CreateRollupFetchTransactionHashParams) {
  const chainId = validateParentChain(publicClient);

  const fromBlock =
    chainId in earliestRollupCreatorDeploymentBlockNumber
      ? earliestRollupCreatorDeploymentBlockNumber[chainId]
      : 'earliest';

  // Find the RollupInitialized event from that Rollup contract
  const rollupInitializedEvents = await publicClient.getLogs({
    address: rollup,
    event: RollupInitializedEventAbi,
    fromBlock,
    toBlock: 'latest',
  });

  if (rollupInitializedEvents.length !== 1) {
    throw new Error(
      `Expected to find 1 RollupInitialized event for rollup address ${rollup} but found ${rollupInitializedEvents.length}`,
    );
  }

  // Get the transaction hash that emitted that event
  const transactionHash = rollupInitializedEvents[0].transactionHash;

  if (!transactionHash) {
    throw new Error(
      `No transactionHash found in RollupInitialized event for rollup address ${rollup}`,
    );
  }

  return transactionHash;
}
