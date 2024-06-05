import { Address, PublicClient } from 'viem';

import { CoreContracts } from './types/CoreContracts';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

export type CreateRollupFetchCoreContractsParams = {
  rollup: Address;
  publicClient: PublicClient;
};

/**
 * Fetches the core contracts for a given rollup.
 *
 * This function retrieves the core contracts associated with a given rollup address by
 * first fetching the transaction hash and then preparing the transaction receipt.
 *
 * @param {CreateRollupFetchCoreContractsParams} createRollupFetchCoreContractsParams - The parameters for fetching core contracts.
 * @param {Address} createRollupFetchCoreContractsParams.rollup - The address of the rollup.
 * @param {PublicClient} createRollupFetchCoreContractsParams.publicClient - The public client to interact with the blockchain.
 *
 * @returns {Promise<CoreContracts>} A promise that resolves to the core contracts.
 *
 * @example
 * const coreContracts = await createRollupFetchCoreContracts({
 *   rollup: '0xYourRollupAddress',
 *   publicClient,
 * });
 * console.log(coreContracts);
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
