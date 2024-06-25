import { Address, PublicClient, Chain, Transport, parseAbi } from 'viem';

import { CoreContracts } from './types/CoreContracts';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';
import { rollupAdminLogicABI } from './abi';

export type CreateRollupFetchCoreContractsParams<TChain extends Chain | undefined> = {
  rollup: Address;
  publicClient: PublicClient<Transport, TChain>;
};

export async function createRollupFetchCoreContracts<TChain extends Chain | undefined>({
  rollup,
  publicClient,
}: CreateRollupFetchCoreContractsParams<TChain>): Promise<CoreContracts> {
  try {
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
  } catch (e) {
    console.warn(`[createRollupFetchCoreContracts] ${(e as Error).message}`);

    const contract = { address: rollup, abi: rollupAdminLogicABI };
    const results = await publicClient.multicall({
      contracts: [
        {
          ...contract,
          functionName: 'sequencerInbox',
        },
        {
          ...contract,
          functionName: 'challengeManager',
        },
        {
          ...contract,
          functionName: 'inbox',
        },
        {
          ...contract,
          functionName: 'outbox',
        },
        {
          ...contract,
          functionName: 'bridge',
        },
        {
          ...contract,
          functionName: 'rollupEventInbox',
        },
        {
          ...contract,
          functionName: 'validatorUtils',
        },
        {
          ...contract,
          functionName: 'validatorWalletCreator',
        },
      ],
    });

    if (results.some((result) => result.status === 'failure')) {
      throw new Error('[createRollupFetchCoreContracts] Fallback to multicall failed');
    }

    const [
      sequencerInbox,
      challengeManager,
      inbox,
      outbox,
      bridge,
      rollupEventInbox,
      validatorUtils,
      validatorWalletCreator,
    ] = results.map((result) => result.result!);

    const nativeToken = await publicClient.readContract({
      address: bridge,
      abi: parseAbi(['function nativeToken() view returns (address)']),
      functionName: 'nativeToken',
    });

    return {
      rollup,
      sequencerInbox,
      challengeManager,
      inbox,
      outbox,
      bridge,
      rollupEventInbox,
      validatorUtils,
      validatorWalletCreator,
      nativeToken,
    };
  }
}
