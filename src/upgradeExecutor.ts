import { encodeFunctionData, EncodeFunctionDataParameters } from 'viem';

import { upgradeExecutor } from './contracts';
import { GetFunctionName, Prettify } from './types/utils';

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

export type UpgradeExecutorFunctionName = GetFunctionName<UpgradeExecutorAbi>;

export type UpgradeExecutorEncodeFunctionDataParameters<
  TFunctionName extends UpgradeExecutorFunctionName
> = Prettify<
  Omit<EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>, 'abi'>
>;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends UpgradeExecutorFunctionName
>({
  functionName,
  args,
}: UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>) {
  // todo: fix this weird type issue
  //
  // @ts-ignore
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  });
}
