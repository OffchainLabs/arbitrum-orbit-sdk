import { Chain, PublicClient, Transport } from 'viem';

import {
  createRollupGetRetryablesFees,
  CreateRollupGetRetryablesFeesParams,
} from './createRollupGetRetryablesFees';
import { createRollupDefaultRetryablesFees } from './constants';

export async function createRollupGetRetryablesFeesWithFallback<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { nativeToken, maxFeePerGasForRetryables }: CreateRollupGetRetryablesFeesParams,
): Promise<bigint> {
  try {
    return await createRollupGetRetryablesFees(publicClient, {
      nativeToken,
      maxFeePerGasForRetryables,
    });
  } catch (error) {
    console.error(
      '[createRollupGetRetryablesFeesWithFallback] failed to fetch retryables fees, falling back to defaults.',
    );
    return createRollupDefaultRetryablesFees;
  }
}
