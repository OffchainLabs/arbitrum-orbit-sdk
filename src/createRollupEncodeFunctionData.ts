import { encodeFunctionData, Hex } from 'viem';

import { rollupCreatorABI as rollupCreatorV3Dot1ABI } from './contracts/RollupCreator/v3.1';
import { rollupCreatorABI as rollupCreatorV2Dot1ABI } from './contracts/RollupCreator/v2.1';

import { CreateRollupFunctionInputs } from './types/createRollupTypes';

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
