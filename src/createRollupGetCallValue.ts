import { CreateRollupParams } from './types/createRollupTypes';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { createRollupDefaultRetryablesFees } from './constants';

export function createRollupGetCallValue(params: CreateRollupParams) {
  // when not deploying deterministic factories to L2, no callvalue is necessary, as no retryable tickets will be created
  if (!params.deployFactoriesToL2) {
    return BigInt(0);
  }

  // when using a custom fee token, the retryable tickets will be paid for in the custom fee token, so no callvalue is necessary
  if (isCustomFeeTokenAddress(params.nativeToken)) {
    return BigInt(0);
  }

  return createRollupDefaultRetryablesFees;
}
