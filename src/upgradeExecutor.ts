import { encodeFunctionData, GetFunctionArgs } from 'viem';

import { upgradeExecutor } from './contracts';
import { GetFunctionName } from './types/utils';

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends GetFunctionName<UpgradeExecutorAbi>
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
