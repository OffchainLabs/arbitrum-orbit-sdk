import { encodeFunctionData, EncodeFunctionDataParameters } from 'viem';

import { upgradeExecutor } from './contracts';
import { GetPrepareTransactionRequestParams, Prettify } from './types/utils';

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

export type UpgradeExecutorFunctionName = GetPrepareTransactionRequestParams<UpgradeExecutorAbi>;

export type UpgradeExecutorEncodeFunctionDataParameters<
  TFunctionName extends UpgradeExecutorFunctionName,
> = Prettify<Omit<EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>, 'abi'>>;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends UpgradeExecutorFunctionName,
>({ functionName, args }: UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  } as EncodeFunctionDataParameters);
}
