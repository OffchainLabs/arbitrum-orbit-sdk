import { Address, PublicClient, Transport, Chain, GetLogsReturnType } from 'viem';
import { AbiEvent } from 'abitype';

import { getLogsWithBatching } from './utils/getLogsWithBatching';
import { getEarliestRollupCreatorDeploymentBlockNumber } from './utils/getEarliestRollupCreatorDeploymentBlockNumber';

export type CreateRollupFetchTransactionHashParams<TChain extends Chain | undefined> = {
  rollup: Address;
  publicClient: PublicClient<Transport, TChain>;
  batching?: boolean;
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

export async function createRollupFetchTransactionHash<TChain extends Chain | undefined>({
  rollup,
  publicClient,
  batching = false,
}: CreateRollupFetchTransactionHashParams<TChain>) {
  // Find the RollupInitialized event from that Rollup contract
  let rollupInitializedEvents: GetLogsReturnType;
  if (batching) {
    rollupInitializedEvents = await getLogsWithBatching(
      publicClient,
      {
        address: rollup,
        event: RollupInitializedEventAbi,
      },
      { stopWhenFound: true },
    );
  } else {
    rollupInitializedEvents = await publicClient.getLogs({
      address: rollup,
      event: RollupInitializedEventAbi,
      fromBlock: getEarliestRollupCreatorDeploymentBlockNumber(publicClient),
      toBlock: 'latest',
    });
  }

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
