import { CreateRollupParams } from './types/createRollupTypes';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { createRollupDefaultRetryablesFees } from './constants';

/**
 * createRollupGetCallValue determines the call value needed for creating
 * retryable tickets based on the provided parameters. It returns a {@link
 * BigInt} representing the call value required. If deploying deterministic
 * factories to L2 is not enabled or a custom fee token is used, the call value
 * will be zero. Otherwise, it returns the default retryables fees.
 */
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
