import { Chain, GetLogsParameters, GetLogsReturnType, PublicClient, Transport } from 'viem';
import { AbiEvent } from 'abitype';

import { validateParentChain } from '../types/ParentChain';
import { getEarliestRollupCreatorDeploymentBlockNumber } from './getEarliestRollupCreatorDeploymentBlockNumber';

type Options = {
  fromBlock?: bigint;
  toBlock?: bigint;
  batchSize?: bigint;
};
export async function getLogsWithBatching<
  TAbiEvent extends AbiEvent,
  TChain extends Chain | undefined,
>(
  publicClient: PublicClient<Transport, TChain>,
  params: Omit<GetLogsParameters<TAbiEvent>, 'blockHash'> & Options,
  param?: { stopWhenFound: true },
): Promise<GetLogsReturnType<TAbiEvent>>;
export async function getLogsWithBatching<
  TAbiEvent extends AbiEvent,
  TChain extends Chain | undefined,
>(
  publicClient: PublicClient<Transport, TChain>,
  params: Omit<GetLogsParameters<undefined, TAbiEvent[]>, 'blockHash'> & Options,
  param?: { stopWhenFound: true },
): Promise<GetLogsReturnType<undefined, TAbiEvent[]>>;
export async function getLogsWithBatching<
  TAbiEvent extends AbiEvent,
  TChain extends Chain | undefined,
>(
  publicClient: PublicClient<Transport, TChain>,
  {
    fromBlock = 0n,
    toBlock,
    batchSize = 9_999n,
    ...getLogsParameters
  }: Omit<GetLogsParameters<TAbiEvent, TAbiEvent[]>, 'blockHash'> & Options,
  param?: { stopWhenFound: true },
) {
  let lowerLimit = fromBlock;
  const latestBlockNumber = await publicClient.getBlockNumber();
  const { chainId } = validateParentChain(publicClient);
  if (!fromBlock && chainId) {
    lowerLimit = getEarliestRollupCreatorDeploymentBlockNumber(chainId);
  }
  const { event, events, args, ...restGetLogsParameters } = getLogsParameters;
  let options = {};
  if (event) {
    options = { event, ...(args ? { args } : {}) };
  } else {
    options = { events };
  }
  try {
    return await publicClient.getLogs({
      ...options,
      ...restGetLogsParameters,
      fromBlock,
      toBlock,
    });
  } catch (e) {
    console.warn(`[getLogsWithBatching] Now batching requests: ${(e as Error).message}`);
    const allEvents = [];

    // Fetch logs `batchSize` blocks at a time to avoid rate limiting
    // We're fetching from most recent block to oldest one
    let cursor = toBlock ?? latestBlockNumber;
    while (cursor >= lowerLimit) {
      const rangeEnd = cursor;
      // If we want to fetch X blocks from 0 (0 and X included), we need to fetch blocks from 0 to X-1
      const rangeStart =
        cursor - batchSize + 1n > lowerLimit ? cursor - batchSize + 1n : lowerLimit;
      const logs = await publicClient.getLogs({
        ...options,
        ...restGetLogsParameters,
        fromBlock: rangeStart,
        toBlock: rangeEnd,
      });

      if (logs) {
        // Add the logs at the beginning to keep the order
        allEvents.unshift(logs);
      }
      if (param?.stopWhenFound && logs.length > 0) {
        return logs;
      }

      cursor = rangeStart - 1n;
    }

    return allEvents.flatMap((events) => events);
  }
}
