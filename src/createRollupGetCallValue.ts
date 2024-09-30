import { Chain, PublicClient, Transport, Address } from 'viem';

import { CreateRollupParams } from './types/createRollupTypes';
import { createRollupGetRetryablesFeesWithDefaults } from './createRollupGetRetryablesFees';

import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';

export async function createRollupGetCallValue<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  params: CreateRollupParams & { account: Address },
): Promise<bigint> {
  // when not deploying deterministic factories to L2, no callvalue is necessary, as no retryable tickets will be created
  if (!params.deployFactoriesToL2) {
    return BigInt(0);
  }

  // when using a custom fee token, the retryable tickets will be paid for in the custom fee token, so no callvalue is necessary
  if (isCustomFeeTokenAddress(params.nativeToken)) {
    return BigInt(0);
  }

  return createRollupGetRetryablesFeesWithDefaults(publicClient, params);
}
