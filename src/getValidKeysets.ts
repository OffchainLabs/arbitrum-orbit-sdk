import { Address, Chain, Hex, PublicClient, Transport, getAbiItem } from 'viem';
import { sequencerInboxABI } from './abi';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';

const SetValidKeysetEventAbi = getAbiItem({ abi: sequencerInboxABI, name: 'SetValidKeyset' });
const InvalidateKeysetEventAbi = getAbiItem({ abi: sequencerInboxABI, name: 'InvalidateKeyset' });

export type GetKeysetsParams = {
  /** Address of the rollup we're getting list of keysets from */
  rollup: Address;
  /** Address of the sequencerInbox we're getting logs from */
  sequencerInbox: Address;
};
export type GetKeysetsReturnType = {
  /**
   * If logs contain unknown signature, keysets list might:
   * - contain false positives (keysets that were removed, but returned as keyset)
   * - contain false negatives (keysets that were added, but not present in the list)
   */
  isAccurate: boolean;
  /** List of keysets for the given rollup */
  keysets: {
    [keysetHash: Hex]: Address;
  };
};

/**
 *
 * @param {PublicClient} publicClient - The chain Viem Public Client
 * @param {GetKeysetsParams} GetKeysetsParams {@link GetKeysetsParams}
 *
 * @returns Promise<{@link GetKeysetsReturnType}>
 *
 * @remarks keysets list is not guaranteed to be exhaustive if the `isAccurate` flag is false.
 * It might contain false positive (keysets that were removed, but returned as keyset)
 * or false negative (keysets that were added, but not present in the list)
 *
 * @example
 * const { isAccurate, keysets } = getKeysets(client, {
 *   rollup: '0xFb209827c58283535b744575e11953DCC4bEAD88',
 *   sequencerInbox: '0x211E1c4c7f1bF5351Ac850Ed10FD68CFfCF6c21b'
 * });
 *
 * if (isAccurate) {
 *   // keysets were all fetched properly
 * } else {
 *   // keysets list is not guaranteed to be accurate
 * }
 */
export async function getKeysets<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { rollup, sequencerInbox }: GetKeysetsParams,
): Promise<GetKeysetsReturnType> {
  let blockNumber: bigint | 'earliest';
  let createRollupTransactionHash: Address | null = null;
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
    blockNumber = 'earliest';
  }

  const events = await publicClient.getLogs({
    address: sequencerInbox,
    events: [SetValidKeysetEventAbi, InvalidateKeysetEventAbi],
    fromBlock: blockNumber,
    toBlock: 'latest',
  });

  let isAccurate = true;
  const keysets = events.reduce((acc, event) => {
    switch (event.eventName) {
      case SetValidKeysetEventAbi.name: {
        const { keysetHash, keysetBytes } = event.args;
        if (!keysetHash || !keysetBytes) {
          isAccurate = false;
          console.warn(`[getKeysets] Missing args for event: ${event.transactionHash}`);
          return acc;
        }
        acc.set(keysetHash, keysetBytes);
        return acc;
      }
      case InvalidateKeysetEventAbi.name: {
        const { keysetHash } = event.args;
        if (!keysetHash) {
          isAccurate = false;
          console.warn(`[getKeysets] Missing args for event: ${event.transactionHash}`);
          return acc;
        }
        acc.delete(keysetHash);
        return acc;
      }
    }
  }, new Map<Hex, Address>());

  return {
    isAccurate,
    keysets: Object.fromEntries(keysets),
  };
}
