import { Address, PublicClient } from 'viem';
import { AbiEvent } from 'abitype';
import { ParentChainId } from './types/ParentChain';
import { sepolia, arbitrumSepolia, nitroTestnodeL1, nitroTestnodeL2 } from './chains';

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
  // testnet
  [sepolia.id]: 4741823n,
  [arbitrumSepolia.id]: 654628n,
  [nitroTestnodeL1.id]: 0n,
  [nitroTestnodeL2.id]: 0n,
};

export async function createRollupFetchTransactionHash({
  rollup,
  publicClient,
}: CreateRollupFetchTransactionHashParams) {
  // Find the RollupInitialized event from that Rollup contract
  const chainId = await publicClient.getChainId();
  const fromBlock =
    chainId in Object.keys(earliestRollupCreatorDeploymentBlockNumber)
      ? earliestRollupCreatorDeploymentBlockNumber[chainId as ParentChainId]
      : 'earliest';

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
