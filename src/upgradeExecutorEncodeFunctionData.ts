import { encodeFunctionData, EncodeFunctionDataParameters, keccak256, toHex } from 'viem';
import { upgradeExecutor } from './contracts';
import { GetFunctionName, Prettify } from './types/utils';

/**
 * Roles
 * @constant {string} UPGRADE_EXECUTOR_ROLE_ADMIN - Role hash for the admin role
 * @constant {string} UPGRADE_EXECUTOR_ROLE_EXECUTOR - Role hash for the executor role
 */
export const UPGRADE_EXECUTOR_ROLE_ADMIN = keccak256(toHex('ADMIN_ROLE'));
export const UPGRADE_EXECUTOR_ROLE_EXECUTOR = keccak256(toHex('EXECUTOR_ROLE'));

/**
 * @typedef {('UPGRADE_EXECUTOR_ROLE_ADMIN' | 'UPGRADE_EXECUTOR_ROLE_EXECUTOR')} UpgradeExecutorRole
 * Type for upgrade executor roles.
 */
export type UpgradeExecutorRole =
  | typeof UPGRADE_EXECUTOR_ROLE_ADMIN
  | typeof UPGRADE_EXECUTOR_ROLE_EXECUTOR;

/**
 * @typedef {Object} UpgradeExecutorAbi - ABI of the upgrade executor contract
 */
export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

/**
 * @typedef {string} UpgradeExecutorFunctionName - Function names in the upgrade executor contract
 */
export type UpgradeExecutorFunctionName = GetFunctionName<UpgradeExecutorAbi>;

/**
 * @typedef {Object} UpgradeExecutorEncodeFunctionDataParameters - Parameters for encoding function data
 * @property {UpgradeExecutorFunctionName} functionName - Name of the function to encode
 * @property {Array<any>} args - Arguments to encode with the function
 */
export type UpgradeExecutorEncodeFunctionDataParameters<
  TFunctionName extends UpgradeExecutorFunctionName,
> = Prettify<Omit<EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>, 'abi'>>;

/**
 * Encodes a function call to be sent through the UpgradeExecutor
 *
 * @template TFunctionName
 * @param {UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>} params - Parameters for encoding function data
 * @param {UpgradeExecutorFunctionName} params.functionName - Name of the function to encode
 * @param {Array<any>} params.args - Arguments to encode with the function
 * @returns {string} Encoded function data
 */
export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends UpgradeExecutorFunctionName,
>({ functionName, args }: UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>): string {
  // @ts-ignore (todo: fix viem type issue)
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  });
}
