import { Address, PublicClient } from 'viem';

import { CoreContracts } from './types/CoreContracts';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

export type CreateRollupFetchCoreContractsParams = {
  rollup: Address;
  publicClient: PublicClient;
};

/**
 * Creates and fetches core contracts for a specified rollup using the provided
 * public client. This function retrieves the transaction hash and prepares the
 * transaction receipt to return the core contracts. Returns a {@link
 * CoreContracts}.
 *
 * @param {CreateRollupFetchCoreContractsParams} createRollupFetchCoreContractsParams - The parameters for fetching core contracts
 * @param {Address} createRollupFetchCoreContractsParams.rollup - The rollup address
 * @param {PublicClient} createRollupFetchCoreContractsParams.publicClient - The public client
 *
 * @returns {Promise<CoreContracts>} - The core contracts
 *
 * @example
 * const coreContracts = await createRollupFetchCoreContracts({
 *   rollup: '0x1234567890abcdef1234567890abcdef12345678',
 *   publicClient: viemPublicClient,
 * });
 */
export async function createRollupFetchCoreContracts({
  rollup,
  publicClient,
}: CreateRollupFetchCoreContractsParams): Promise<CoreContracts> {
  // getting core contract addresses
  const transactionHash = await createRollupFetchTransactionHash({
    rollup,
    publicClient,
  });

  const transactionReceipt = createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    }),
  );

  return transactionReceipt.getCoreContracts();
}
