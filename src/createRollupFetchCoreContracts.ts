import { Address, PublicClient } from 'viem';
import { validParentChainId } from './types/ParentChain';
import { CoreContracts } from './types/CoreContracts';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

export type CreateRollupFetchCoreContractsParams = {
  rollup: Address;
  publicClient: PublicClient;
};

export async function createRollupFetchCoreContracts({
  rollup,
  publicClient,
}: CreateRollupFetchCoreContractsParams): Promise<CoreContracts> {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

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
