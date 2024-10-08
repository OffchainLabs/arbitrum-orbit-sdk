import { Chain, GetLogsParameters, GetLogsReturnType, PublicClient, Transport } from 'viem';
import { AbiEvent } from 'abitype';

import { validateParentChain } from '../types/ParentChain';
import { getEarliestRollupCreatorDeploymentBlockNumber } from './getEarliestRollupCreatorDeploymentBlockNumber';

export async function getLogsWithBatching<
  TAbiEvent extends AbiEvent,
  TChain extends Chain | undefined,
>(
  publicClient: PublicClient<Transport, TChain>,
  {
    fromBlock = 0n,
    ...getLogsParameters
  }: Omit<GetLogsParameters<TAbiEvent>, 'toBlock' | 'blockHash'> & {
    fromBlock?: bigint;
  },
  param?: { stopWhenFound: true },
): Promise<GetLogsReturnType<TAbiEvent>>;
export async function getLogsWithBatching<
  TAbiEvent extends AbiEvent,
  TChain extends Chain | undefined,
>(
  publicClient: PublicClient<Transport, TChain>,
  {
    fromBlock = 0n,
    ...getLogsParameters
  }: Omit<GetLogsParameters<undefined, TAbiEvent[]>, 'toBlock' | 'blockHash'> & {
    fromBlock?: bigint;
  },
  param?: { stopWhenFound: true },
): Promise<GetLogsReturnType<undefined, TAbiEvent[]>>;
export async function getLogsWithBatching<
  TAbiEvent extends AbiEvent,
  TChain extends Chain | undefined,
>(
  publicClient: PublicClient<Transport, TChain>,
  {
    fromBlock = 0n,
    ...getLogsParameters
  }: Omit<GetLogsParameters<TAbiEvent, TAbiEvent[]>, 'toBlock' | 'blockHash'> & {
    fromBlock?: bigint;
  },
  param?: { stopWhenFound: true },
) {
  let lowerLimit = fromBlock;
  const latestBlockNumber = await publicClient.getBlockNumber();
  const { chainId } = validateParentChain(publicClient);
  if (!fromBlock && chainId) {
    const earliestBlock = getEarliestRollupCreatorDeploymentBlockNumber(chainId);
    lowerLimit = earliestBlock === 'latest' ? latestBlockNumber : earliestBlock;
  }

  const allEvents = [];

  // Fetch logs 9999 blocks at a time to avoid rate limiting
  // We're fetching from most recent block to oldest one
  let cursor = latestBlockNumber;
  while (cursor >= lowerLimit) {
    const rangeEnd = cursor;
    const rangeStart = cursor - 9_999n > lowerLimit ? cursor - 9_998n : lowerLimit;
    const events = await publicClient.getLogs({
      ...(getLogsParameters.event
        ? { event: getLogsParameters.event, args: getLogsParameters.args }
        : { events: getLogsParameters.events }),
      address: getLogsParameters.address,
      fromBlock: rangeStart,
      toBlock: rangeEnd,
    });

    allEvents.push(events);
    if (param?.stopWhenFound && events.length > 0) {
      return events;
    }

    cursor = rangeStart - 1n;
  }

  return allEvents.flatMap((events) => events);
}
