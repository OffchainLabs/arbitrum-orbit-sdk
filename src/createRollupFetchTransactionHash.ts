import { Address, PublicClient, Transport, Chain, GetLogsReturnType } from 'viem';
import { AbiEvent } from 'abitype';

import { getLogsWithBatching } from './utils/getLogsWithBatching';
import { getEarliestRollupCreatorDeploymentBlockNumber } from './utils/getEarliestRollupCreatorDeploymentBlockNumber';

export type CreateRollupFetchTransactionHashParams<TChain extends Chain | undefined> = {
  rollup: Address;
  publicClient: PublicClient<Transport, TChain>;
  fromBlock?: bigint;
};

const RollupInitializedEventAbi = {
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
} as const satisfies AbiEvent;

export async function getRollupInitializedEvents<TChain extends Chain | undefined>({
  rollup,
  publicClient,
  fromBlock,
}: CreateRollupFetchTransactionHashParams<TChain>) {
  // Find the RollupInitialized event from that Rollup contract
  const rollupInitializedEvents = await getLogsWithBatching(publicClient, {
    address: rollup,
    event: RollupInitializedEventAbi,
    fromBlock: fromBlock ?? getEarliestRollupCreatorDeploymentBlockNumber(publicClient),
  });

  if (rollupInitializedEvents.length !== 1) {
    throw new Error(
      `Expected to find 1 RollupInitialized event for rollup address ${rollup} but found ${rollupInitializedEvents.length}`,
    );
  }

  return rollupInitializedEvents;
}

export async function createRollupFetchTransactionHash<TChain extends Chain | undefined>({
  rollup,
  publicClient,
  fromBlock,
}: CreateRollupFetchTransactionHashParams<TChain>) {
  // Get the transaction hash that emitted that event
  const transactionHash = (await getRollupInitializedEvents({ rollup, publicClient, fromBlock }))[0]
    .transactionHash;

  if (!transactionHash) {
    throw new Error(
      `No transactionHash found in RollupInitialized event for rollup address ${rollup}`,
    );
  }

  return transactionHash;
}
