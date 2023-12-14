import {
  parseAbi,
  encodeFunctionData,
  EncodeFunctionDataParameters,
} from 'viem';

import { GetFunctionName, Prettify } from './types/utils';

export const upgradeExecutor = {
  abi: parseAbi([
    'function test(address something)',
    'function execute(address upgrade, bytes upgradeCallData)',
    'function executeCall(address target, bytes targetCallData)',
  ]),
};

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

export type UpgradeExecutorFunctionName = GetFunctionName<UpgradeExecutorAbi>;

export type UpgradeExecutorEncodeFunctionDataParameters<
  TFunctionName extends
    | UpgradeExecutorFunctionName
    | undefined = UpgradeExecutorFunctionName
> = Prettify<
  Omit<EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>, 'abi'>
>;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends
    | UpgradeExecutorFunctionName
    | undefined = UpgradeExecutorFunctionName
>({
  functionName,
  args,
}: UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  });
}

upgradeExecutorEncodeFunctionData({
  functionName: 'test',
  args: [],
});

upgradeExecutorEncodeFunctionData({
  functionName: 'execute',
  args: [],
});
