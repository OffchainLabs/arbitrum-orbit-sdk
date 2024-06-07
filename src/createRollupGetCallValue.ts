import { CreateRollupParams } from './types/createRollupTypes';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { createRollupDefaultRetryablesFees } from './constants';

/**
 * Calculates the call value required for creating rollup.
 *
 * When not deploying deterministic factories to L2, no call value is necessary as no retryable tickets will be created.
 * When using a custom fee token, the retryable tickets will be paid for in the custom fee token, so no call value is necessary.
 *
 * @param {CreateRollupParams} params - The parameters for creating the rollup.
 * @param {Object} params.config - The chain configuration.
 * @param {string} params.batchPoster - The batchPoster address.
 * @param {Array<string>} params.validators - The validator(s) address array.
 * @param {boolean} [params.deployFactoriesToL2=true] - Optional, defaults to true. Indicates if factories will be deployed to L2.
 * @param {string} [params.nativeToken=] - The native token address, optional, defaults to ETH.
 * @param {number} [params.maxDataSize=104857] - The max calldata size, optional, defaults to 104_857 B for Orbit chains.
 * @param {number} [params.maxFeePerGasForRetryables=0.1] - The max fee per gas for retryables, optional, defaults to 0.1 gwei.
 *
 * @returns {bigint} - The call value required for creating the rollup.
 */
export function createRollupGetCallValue(params: CreateRollupParams): bigint {
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
