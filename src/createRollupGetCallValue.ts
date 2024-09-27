import { Chain, PublicClient, Transport } from 'viem';

import { CreateRollupParams } from './types/createRollupTypes';
import { createRollupGetRetryablesFeesWithFallback } from './createRollupGetRetryablesFees';

import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';

export async function createRollupGetCallValue<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  params: CreateRollupParams,
): Promise<bigint> {
  // when not deploying deterministic factories to L2, no callvalue is necessary, as no retryable tickets will be created
  if (!params.deployFactoriesToL2) {
    return BigInt(0);
  }

  // when using a custom fee token, the retryable tickets will be paid for in the custom fee token, so no callvalue is necessary
  if (isCustomFeeTokenAddress(params.nativeToken)) {
    return BigInt(0);
  }

  return await createRollupGetRetryablesFeesWithFallback(publicClient, params);
}
