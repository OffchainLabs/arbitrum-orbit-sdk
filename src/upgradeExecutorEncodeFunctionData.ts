import { encodeFunctionData, EncodeFunctionDataParameters, keccak256, toHex } from 'viem';
import { upgradeExecutor } from './contracts';
import { GetFunctionName, Prettify } from './types/utils';

// Roles
export const UPGRADE_EXECUTOR_ROLE_ADMIN = keccak256(toHex('ADMIN_ROLE'));
export const UPGRADE_EXECUTOR_ROLE_EXECUTOR = keccak256(toHex('EXECUTOR_ROLE'));

// Types for upgradeExecutorEncodeFunctionData
export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;
export type UpgradeExecutorFunctionName = GetFunctionName<UpgradeExecutorAbi>;
export type UpgradeExecutorEncodeFunctionDataParameters<
  TFunctionName extends UpgradeExecutorFunctionName,
> = Prettify<Omit<EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>, 'abi'>>;

// Encodes a function call to be sent through the UpgradeExecutor
export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends UpgradeExecutorFunctionName,
>({ functionName, args }: UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>) {
  // @ts-ignore (todo: fix viem type issue)
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  });
}
