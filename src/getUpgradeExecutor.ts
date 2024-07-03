import { Address, Chain, PublicClient, Transport, decodeFunctionData, getAbiItem, getFunctionSelector } from 'viem';
import { rollupAdminLogicABI, safeL2ABI } from './abi';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { isValidParentChainId } from './types/ParentChain';
import { arbOwnerPublic, upgradeExecutor } from './contracts';
import { UPGRADE_EXECUTOR_ROLE_ADMIN } from './upgradeExecutorEncodeFunctionData';

const AdminChangedAbi = getAbiItem({ abi: rollupAdminLogicABI, name: 'AdminChanged' });

export type GetUpgradeExecutorParams = {
  /** Address of the rollup we're getting logs from */
  rollup: Address;
} | void;
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
  params: GetUpgradeExecutorParams,
): Promise<GetUpgradeExecutorReturnType> {
  const isParentChain = isValidParentChainId(publicClient.chain?.id)
  if (isParentChain && !params) {
    throw new Error('[getUpgradeExecutor] requires a rollup address')
  }

  // Parent chain, get the newOwner args from the last event
  if (isParentChain && params) {
    let blockNumber: bigint | 'earliest';
    let createRollupTransactionHash: Address | null = null;

    try {
      createRollupTransactionHash = await createRollupFetchTransactionHash({
        rollup: params.rollup,
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
      address: params.rollup,
      events: [AdminChangedAbi],
      fromBlock: blockNumber,
      toBlock: 'latest',
    });

    return events[events.length - 1].args.newAdmin;
  }

  // Child chain, check for all chainOwners
  const chainOwners = await publicClient.readContract({
    abi: arbOwnerPublic.abi,
    functionName: 'getAllChainOwners',
    address: arbOwnerPublic.address
  });

  const results = await Promise.allSettled(chainOwners.map(chainOwner => publicClient.readContract({
    address: chainOwner,
    abi: upgradeExecutor.abi,
    functionName: 'hasRole',
    args: [UPGRADE_EXECUTOR_ROLE_ADMIN, chainOwner],
  })))
  const upgradeExecutorIndex = results.findIndex(p => p.status === 'fulfilled' && p.value === true)
  return chainOwners[upgradeExecutorIndex]
}
