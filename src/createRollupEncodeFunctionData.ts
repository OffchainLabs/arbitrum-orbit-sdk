import { encodeFunctionData, Hex } from 'viem';

import { rollupCreatorABI as rollupCreatorV3Dot1ABI } from './contracts/RollupCreator/v3.1';
import { rollupCreatorABI as rollupCreatorV2Dot1ABI } from './contracts/RollupCreator/v2.1';

import { CreateRollupFunctionInputs } from './types/createRollupTypes';

// function overloads for createRollupEncodeFunctionData
export function createRollupEncodeFunctionData(
  args: CreateRollupFunctionInputs<'v2.1'>,
  rollupCreatorVersion: 'v2.1',
): Hex;
export function createRollupEncodeFunctionData(
  args: CreateRollupFunctionInputs<'v3.1'>,
  rollupCreatorVersion: 'v3.1',
): Hex;
export function createRollupEncodeFunctionData(
  args: CreateRollupFunctionInputs<'v3.1'>,
  // rollupCreatorVersion defaults to v3.1
): Hex;

// implementation with union types
export function createRollupEncodeFunctionData(
  args: CreateRollupFunctionInputs<'v2.1'> | CreateRollupFunctionInputs<'v3.1'>,
  rollupCreatorVersion: 'v2.1' | 'v3.1' = 'v3.1',
) {
  if (rollupCreatorVersion === 'v2.1') {
    return encodeFunctionData({
      abi: rollupCreatorV2Dot1ABI,
      functionName: 'createRollup',
      args: args as CreateRollupFunctionInputs<'v2.1'>,
    });
  }

  return encodeFunctionData({
    abi: rollupCreatorV3Dot1ABI,
    functionName: 'createRollup',
    args: args as CreateRollupFunctionInputs<'v3.1'>,
  });
}
