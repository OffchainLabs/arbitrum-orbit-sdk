import { encodeFunctionData, GetFunctionArgs } from 'viem';

import { upgradeExecutor } from './contracts';
import { GetFunctionName } from './types/utils';

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;
export type UpgradeExecutorFunctionName = GetFunctionName<UpgradeExecutorAbi>;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends UpgradeExecutorFunctionName
>({
  functionName,
  args,
}: { functionName: TFunctionName } & GetFunctionArgs<
  UpgradeExecutorAbi,
  TFunctionName
>) {
  // todo: fix this weird type issue
  //
  // @ts-ignore
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  });
}
