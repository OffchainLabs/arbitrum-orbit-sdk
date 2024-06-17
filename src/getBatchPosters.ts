import {
  Address,
  Chain,
  Hex,
  PublicClient,
  Transport,
  decodeFunctionData,
  getAbiItem,
  getFunctionSelector,
} from 'viem';
import { rollupCreator, upgradeExecutor } from './contracts';
import { safeL2ABI, sequencerInboxABI } from './abi';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';

const createRollupABI = getAbiItem({ abi: rollupCreator.abi, name: 'createRollup' });
const createRollupFunctionSelector = getFunctionSelector(createRollupABI);

const setIsBatchPosterABI = getAbiItem({ abi: sequencerInboxABI, name: 'setIsBatchPoster' });
const setIsBatchPosterFunctionSelector = getFunctionSelector(setIsBatchPosterABI);

const executeCallABI = getAbiItem({ abi: upgradeExecutor.abi, name: 'executeCall' });
const upgradeExecutorExecuteCallFunctionSelector = getFunctionSelector(executeCallABI);

const execTransactionABI = getAbiItem({ abi: safeL2ABI, name: 'execTransaction' });
const safeL2FunctionSelector = getFunctionSelector(execTransactionABI);

const ownerFunctionCalledEventAbi = getAbiItem({
  abi: sequencerInboxABI,
  name: 'OwnerFunctionCalled',
});

function getBatchPostersFromFunctionData<
  TAbi extends (typeof createRollupABI)[] | (typeof setIsBatchPosterABI)[],
>({ abi, data }: { abi: TAbi; data: Hex }) {
  const { args } = decodeFunctionData({
    abi,
    data,
  });
  return args;
}

function updateAccumulator(acc: Set<Address>, input: Hex) {
  const [batchPoster, isAdd] = getBatchPostersFromFunctionData({
    abi: [setIsBatchPosterABI],
    data: input,
  });

  if (isAdd) {
    acc.add(batchPoster);
  } else {
    acc.delete(batchPoster);
  }

  return acc;
}

export type GetBatchPostersParams = {
  /** Address of the rollup we're getting list of batch posters from */
  rollup: Address;
  /** Address of the sequencerInbox we're getting logs from */
  sequencerInbox: Address;
};
export type GetBatchPostersReturnType = {
  /**
   * If logs contain unknown signature, batch posters list might:
   * - contain false positives (batch posters that were removed, but returned as batch poster)
   * - contain false negatives (batch posters that were added, but not present in the list)
   */
  isAccurate: boolean;
  /** List of batch posters for the given rollup */
  batchPosters: Address[];
};

/**
 *
 * @param {PublicClient} publicClient - The chain Viem Public Client
 * @param {GetBatchPostersParams} GetBatchPostersParams {@link GetBatchPostersParams}
 *
 * @returns Promise<{@link GetBatchPostersReturnType}>
 *
 * @remarks Batch posters list is not guaranteed to be exhaustive if the `isAccurate` flag is false.
 * It might contain false positive (batch posters that were removed, but returned as batch poster)
 * or false negative (batch posters that were added, but not present in the list)
 *
 * @example
 * const { isAccurate, batchPosters } = getBatchPosters(client, {
 *   rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336',
 *   sequencerInbox: '0x995a9d3ca121D48d21087eDE20bc8acb2398c8B1'
 * });
 *
 * if (isAccurate) {
 *   // batch posters were all fetched properly
 * } else {
 *   // batch posters list is not guaranteed to be accurate
 * }
 */
export async function getBatchPosters<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { rollup, sequencerInbox }: GetBatchPostersParams,
): Promise<GetBatchPostersReturnType> {
  let blockNumber: bigint | 'earliest';
  let createRollupTransactionHash = null;
  try {
    createRollupTransactionHash = await createRollupFetchTransactionHash({
      rollup,
      publicClient,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: createRollupTransactionHash,
    });
    blockNumber = receipt.blockNumber;
  } catch (e) {
    blockNumber = 'earliest';
  }

  const sequencerInboxEvents = await publicClient.getLogs({
    address: sequencerInbox,
    event: ownerFunctionCalledEventAbi,
    args: { id: 6n },
    fromBlock: blockNumber,
    toBlock: blockNumber,
  });

  const events = createRollupTransactionHash
    ? [{ transactionHash: createRollupTransactionHash }, ...sequencerInboxEvents]
    : sequencerInboxEvents;
  const txs = await Promise.all(
    events.map((event) =>
      publicClient.getTransaction({
        hash: event.transactionHash,
      }),
    ),
  );

  let isAccurate = true;
  const batchPosters = txs.reduce((acc, tx) => {
    const txSelectedFunction = tx.input.slice(0, 10);

    switch (txSelectedFunction) {
      case createRollupFunctionSelector: {
        const [{ batchPoster }] = getBatchPostersFromFunctionData({
          abi: [createRollupABI],
          data: tx.input,
        });

        return new Set([...acc, batchPoster]);
      }
      case setIsBatchPosterFunctionSelector: {
        return updateAccumulator(acc, tx.input);
      }
      case upgradeExecutorExecuteCallFunctionSelector: {
        const { args: executeCallCalldata } = decodeFunctionData({
          abi: [executeCallABI],
          data: tx.input,
        });
        return updateAccumulator(acc, executeCallCalldata[1]);
      }
      case safeL2FunctionSelector: {
        const { args: execTransactionCalldata } = decodeFunctionData({
          abi: [execTransactionABI],
          data: tx.input,
        });
        const { args: executeCallCalldata } = decodeFunctionData({
          abi: [executeCallABI],
          data: execTransactionCalldata[2],
        });
        return updateAccumulator(acc, executeCallCalldata[1]);
      }
      default: {
        console.warn(`[getBatchPosters] unknown 4bytes, tx id: ${tx.hash}`);
        isAccurate = false;
        return acc;
      }
    }
  }, new Set<Address>());

  return {
    isAccurate,
    batchPosters: [...batchPosters],
  };
}
