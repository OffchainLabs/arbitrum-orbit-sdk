import {
  parseAbi,
  encodeFunctionData,
  EncodeFunctionDataParameters,
} from 'viem';

import { GetFunctionName } from './types/utils';

export const upgradeExecutor = {
  abi: parseAbi([
    'function test(address something)',
    'function execute(address upgrade, bytes upgradeCallData)',
    'function executeCall(address target, bytes targetCallData)',
  ]),
};

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends GetFunctionName<UpgradeExecutorAbi>
>({
  functionName,
  args,
}: EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>) {
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
