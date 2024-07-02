import { Address, Chain, PublicClient, Transport, getAbiItem } from 'viem';
import { rollupAdminLogicABI } from './abi';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';

const AdminChangedAbi = getAbiItem({ abi: rollupAdminLogicABI, name: 'AdminChanged' });

export type GetUpgradeExecutorParams = {
  /** Address of the rollup we're getting logs from */
  rollup: Address;
};
/**
 * Address of the current upgrade executor
 */
export type GetUpgradeExecutorReturnType = Address | undefined;

/**
 *
 * @param {PublicClient} publicClient - The chain Viem Public Client
 * @param {GetUpgradeExecutorParams} GetUpgradeExecutorParams {@link GetUpgradeExecutorParams}
 *
 * @returns Promise<{@link GetUpgradeExecutorReturnType}>
 *
 * @example
 * const upgradeExecutor = getUpgradeExecutor(client, {
 *   rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336'
 * });
 *
 */
export async function getUpgradeExecutor<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { rollup }: GetUpgradeExecutorParams,
): Promise<GetUpgradeExecutorReturnType> {
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
    console.warn(`[getUpgradeExecutor] ${(e as any).message}`);
    blockNumber = 'earliest';
  }

  const events = await publicClient.getLogs({
    address: rollup,
    events: [AdminChangedAbi],
    fromBlock: blockNumber,
    toBlock: 'latest',
  });

  return events[events.length - 1].args.newAdmin;
}
