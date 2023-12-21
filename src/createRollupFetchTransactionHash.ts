import { deterministicFactoriesDeploymentEstimatedFees } from './constants';
import { Address, PublicClient } from 'viem';
import { AbiEvent } from 'abitype'

const RollupInitializedEventAbi: AbiEvent = {
  anonymous: false,
  inputs: [
      {
          indexed: false,
          internalType: "bytes32",
          name: "machineHash",
          type: "bytes32",
      },
      {
          indexed: false,
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
      },
  ],
  name: "RollupInitialized",
  type: "event",
};

export async function createRollupFetchTransactionHash(
  rollupAddress: Address,
  publicClient: PublicClient,
) {
  // Find the RollupInitialized event from that Rollup contract
  const rollupInitializedEvents = await publicClient.getLogs({
    address: rollupAddress,
    event: RollupInitializedEventAbi,
    fromBlock: 'earliest',
    toBlock: 'latest',
  });
  if (!rollupInitializedEvents || rollupInitializedEvents.length <= 0) {
    throw new Error(`No RollupInitialized event found for rollup address ${rollupAddress}`);
  }

  // Get the transaction hash that emitted that event
  const transactionHash = rollupInitializedEvents[0].transactionHash;
  if (!transactionHash) {
    throw new Error(`No transactionHash found in RollupInitialized event for rollup address ${rollupAddress}`);
  }

  return transactionHash;
}
