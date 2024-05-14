import {
  Address,
  PublicClient,
  encodeFunctionData,
  PrepareTransactionRequestReturnType,
} from 'viem';
import { upgradeExecutor } from './contracts';
import {
  UPGRADE_EXECUTOR_ROLE_EXECUTOR,
  upgradeExecutorEncodeFunctionData,
} from './upgradeExecutorEncodeFunctionData';
import { validateChain } from './utils/validateChain';

/**
 * Type for the params of the {@link upgradeExecutorPrepareRemoveExecutorTransactionRequest} function
 */
export type UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams = {
  account: Address;
  upgradeExecutorAddress: Address;
  executorAccountAddress: Address;
  publicClient: PublicClient;
};

/**
 * Prepares a transaction to revoke the executor role from an account
 *
 * - Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)
 *
 * @param {UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams} upgradeExecutorPrepareRemoveExecutorTransactionRequestParams {@link UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams}
 * @param {Address} upgradeExecutorPrepareRemoveExecutorTransactionRequestParams.account - Address of the account to be revoked the executor role
 * @param {Address} upgradeExecutorPrepareRemoveExecutorTransactionRequestParams.upgradeExecutorAddress - Address of the UpgradeExecutor contract
 * @param {Address} upgradeExecutorPrepareRemoveExecutorTransactionRequestParams.executorAccountAddress - Address of the account that already has the executor role (will send the transaction)
 * @param {PublicClient} upgradeExecutorPrepareRemoveExecutorTransactionRequestParams.publicClient - The chain Viem Public Client
 *
 * @returns Promise<{@link PrepareTransactionRequestReturnType}> - the transaction request
 *
 * @example
 * const removeExecutorTransactionRequest = await upgradeExecutorPrepareRemoveExecutorTransactionRequest({
 *   account: accountAddress,
 *   upgradeExecutorAddress: coreContracts.upgradeExecutor,
 *   executorAccountAddress: deployer.address,
 *   publicClient,
 * });
 */
export async function upgradeExecutorPrepareRemoveExecutorTransactionRequest({
  account,
  upgradeExecutorAddress,
  executorAccountAddress,
  publicClient,
}: UpgradeExecutorPrepareRemoveExecutorTransactionRequestParams) {
  const chainId = validateChain(publicClient);

  // 0. Verify that the account doesn't have the EXECUTOR role already
  const accountHasExecutorRole = await publicClient.readContract({
    address: upgradeExecutorAddress,
    abi: upgradeExecutor.abi,
    functionName: 'hasRole',
    args: [UPGRADE_EXECUTOR_ROLE_EXECUTOR, account],
  });
  if (!accountHasExecutorRole) {
    throw new Error(`Account ${account} does not have the Executor role`);
  }

  // 1. Encode the calldata to be sent in the transaction (through the UpgradeExecutor)
  const revokeRoleCalldata = encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName: 'revokeRole',
    args: [
      UPGRADE_EXECUTOR_ROLE_EXECUTOR, // role
      account, // account
    ],
  });

  // 2. Prepare the transaction (must be called through the UpgradeExecutor)
  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: upgradeExecutorAddress,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        upgradeExecutorAddress, // target
        revokeRoleCalldata, // targetCallData
      ],
    }),
    account: executorAccountAddress,
  });

  return { ...request, chainId };
}
