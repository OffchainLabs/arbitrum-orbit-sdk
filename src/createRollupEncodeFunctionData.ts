import { encodeFunctionData, Hex } from 'viem';

import { rollupCreatorABI as rollupCreatorV3Dot1ABI } from './contracts/RollupCreator/v3.1';
import { rollupCreatorABI as rollupCreatorV2Dot1ABI } from './contracts/RollupCreator/v2.1';

import { CreateRollupFunctionInputs } from './types/createRollupTypes';

/**
 * Parameters for encoding the `createRollup` function call data. The parameters vary based on the RollupCreator version provided:
 *
 * - **v2.1**: Uses the v2.1 ABI and corresponding function inputs
 * - **v3.1**: Uses the v3.1 ABI and corresponding function inputs (default if no version specified)
 */
export type CreateRollupEncodeFunctionDataParams =
  | {
      rollupCreatorVersion: 'v2.1';
      args: CreateRollupFunctionInputs<'v2.1'>;
    }
  | {
      rollupCreatorVersion: 'v3.1';
      args: CreateRollupFunctionInputs<'v3.1'>;
    }
  | {
      rollupCreatorVersion?: never;
      args: CreateRollupFunctionInputs<'v3.1'>;
    };

/**
 * Encodes function data for the `createRollup` function call based on the RollupCreator version using the appropriate ABI.
 *
 * @param {CreateRollupEncodeFunctionDataParams} params - The encoding parameters
 * @param {('v2.1' | 'v3.1')} [params.rollupCreatorVersion] - Rollup creator version (defaults to v3.1)
 * @param {CreateRollupFunctionInputs} params.args - Function arguments matching the specified version
 * @returns {Hex} The encoded function data as a hex string
 *
 * @example
 * // Encode for default version
 * const encodedData = createRollupEncodeFunctionData({
 *   args
 * });
 *
 * @example
 * // Encode for specific version
 * const encodedDataV2 = createRollupEncodeFunctionData({
 *   rollupCreatorVersion: 'v2.1',
 *   args
 * });
 *
 * const encodedDataV3 = createRollupEncodeFunctionData({
 *   rollupCreatorVersion: 'v3.1',
 *   args
 * });
 *
 * @see {@link https://docs.arbitrum.io/launch-orbit-chain/how-tos/orbit-sdk-deploying-rollup-chain}
 */
export function createRollupEncodeFunctionData(params: CreateRollupEncodeFunctionDataParams): Hex {
  const rollupCreatorVersion =
    'rollupCreatorVersion' in params && typeof params.rollupCreatorVersion === 'string' //
      ? params.rollupCreatorVersion
      : 'v3.1';

  if (rollupCreatorVersion === 'v2.1') {
    return encodeFunctionData({
      abi: rollupCreatorV2Dot1ABI,
      functionName: 'createRollup',
      args: params.args as CreateRollupFunctionInputs<'v2.1'>,
    });
  }

  return encodeFunctionData({
    abi: rollupCreatorV3Dot1ABI,
    functionName: 'createRollup',
    args: params.args as CreateRollupFunctionInputs<'v3.1'>,
  });
}
