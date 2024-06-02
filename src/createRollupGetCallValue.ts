import { CreateRollupParams } from './types/createRollupTypes';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { createRollupDefaultRetryablesFees } from './constants';

/**
 * Calculates the call value needed for creating retryable tickets in a rollup chain.
 *
 * @param {CreateRollupParams} params - The parameters for creating the rollup.
 * @param {Object} params.config - The chain config.
 * @param {string} params.batchPoster - The batchPoster address.
 * @param {Array<string>} params.validators - The validator(s) address array.
 * @param {boolean} [params.deployFactoriesToL2=true] - Optional, defaults to true. Deploying factories via retryable tickets at rollup creation time is the most reliable method to do it since it doesn't require paying the L1 gas.
 * @param {string} [params.nativeToken=ETH] - The native token address, optional, defaults to ETH.
 * @param {number} [params.maxDataSize=104857] - The max calldata size, optional, defaults to 104857 bytes for Orbit chains.
 * @param {number} [params.maxFeePerGasForRetryables=0.1] - The max fee per gas for retryables, optional, defaults to 0.1 gwei.
 *
 * @returns {BigInt} - The calculated call value.
 *
 * @example
 * const callValue = createRollupGetCallValue({
 *   config: createRollupConfig,
 *   batchPoster: '0x1234...',
 *   validators: ['0x5678...', '0x9abc...'],
 *   deployFactoriesToL2: true,
 *   nativeToken: '0xdef0...',
 *   maxDataSize: 104857,
 *   maxFeePerGasForRetryables: 0.1,
 * });
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
