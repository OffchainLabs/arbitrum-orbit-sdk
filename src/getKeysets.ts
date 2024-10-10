import { Address, Chain, Hex, PublicClient, Transport, getAbiItem } from 'viem';

import { sequencerInboxABI } from './contracts/SequencerInbox';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { getLogsWithBatching } from './utils/getLogsWithBatching';

const SetValidKeysetEventAbi = getAbiItem({ abi: sequencerInboxABI, name: 'SetValidKeyset' });
const InvalidateKeysetEventAbi = getAbiItem({ abi: sequencerInboxABI, name: 'InvalidateKeyset' });

export type GetKeysetsParams = {
  /** Address of the sequencerInbox we're getting logs from */
  sequencerInbox: Address;
};
export type GetKeysetsReturnType = {
  /** Map of keyset hash to keyset bytes
   *  keyset hash are used to invalidate a given keyset
   */
  keysets: {
    [keysetHash: Hex]: Hex;
  };
};

/**
 *
 * @param {PublicClient} publicClient - The chain Viem Public Client
 * @param {GetKeysetsParams} GetKeysetsParams {@link GetKeysetsParams}
 *
 * @returns Promise<{@link GetKeysetsReturnType}>
 *
 * @example
 * const { keysets } = getKeysets(client, {
 *   sequencerInbox: '0x211E1c4c7f1bF5351Ac850Ed10FD68CFfCF6c21b'
 * });
 *
 */
export async function getKeysets<TChain extends Chain>(
  publicClient: PublicClient<Transport, TChain>,
  { sequencerInbox }: GetKeysetsParams,
): Promise<GetKeysetsReturnType> {
  let blockNumber: bigint;
  let createRollupTransactionHash: Address | null = null;
  const rollup = await publicClient.readContract({
    functionName: 'rollup',
    address: sequencerInbox,
    abi: sequencerInboxABI,
  });
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
    console.warn(`[getKeysets] ${(e as any).message}`);
    blockNumber = 0n;
  }

  const events = await getLogsWithBatching(publicClient, {
    address: sequencerInbox,
    events: [SetValidKeysetEventAbi, InvalidateKeysetEventAbi],
    fromBlock: blockNumber,
  });

  const keysets = events.reduce((acc, event) => {
    switch (event.eventName) {
      case SetValidKeysetEventAbi.name: {
        const { keysetHash, keysetBytes } = event.args;
        if (!keysetHash || !keysetBytes) {
          console.warn(`[getKeysets] Missing args for event: ${event.transactionHash}`);
          return acc;
        }
        acc.set(keysetHash, keysetBytes);
        return acc;
      }
      case InvalidateKeysetEventAbi.name: {
        const { keysetHash } = event.args;
        if (!keysetHash) {
          console.warn(`[getKeysets] Missing args for event: ${event.transactionHash}`);
          return acc;
        }
        acc.delete(keysetHash);
        return acc;
      }
    }
  }, new Map<Hex, Hex>());

  return {
    keysets: Object.fromEntries(keysets),
  };
}
