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
 * Type for the params of the {@link upgradeExecutorPrepareAddExecutorTransactionRequest} function
 */
export type UpgradeExecutorPrepareAddExecutorTransactionRequestParams = {
  account: Address;
  upgradeExecutorAddress: Address;
  executorAccountAddress: Address;
  publicClient: PublicClient;
};

/**
 * Prepares a transaction to grant the executor role to a new account
 *
 * - Example: [Add new executor account to UpgradeExecutor](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/upgrade-executor-add-account/index.ts)
 *
 * @param {UpgradeExecutorPrepareAddExecutorTransactionRequestParams} upgradeExecutorPrepareAddExecutorTransactionRequestParams {@link UpgradeExecutorPrepareAddExecutorTransactionRequestParams}
 * @param {Address} upgradeExecutorPrepareAddExecutorTransactionRequestParams.account - Address of the account to be granted the executor role
 * @param {Address} upgradeExecutorPrepareAddExecutorTransactionRequestParams.upgradeExecutorAddress - Address of the UpgradeExecutor contract
 * @param {Address} upgradeExecutorPrepareAddExecutorTransactionRequestParams.executorAccountAddress - Address of the account that already has the executor role (will send the transaction)
 * @param {PublicClient} upgradeExecutorPrepareAddExecutorTransactionRequestParams.publicClient - The chain Viem Public Client
 *
 * @returns Promise<{@link PrepareTransactionRequestReturnType}> - the transaction request
 *
 * @example
 * const addExecutorTransactionRequest = await upgradeExecutorPrepareAddExecutorTransactionRequest({
 *   account: newExecutorAccountAddress,
 *   upgradeExecutorAddress: coreContracts.upgradeExecutor,
 *   executorAccountAddress: deployer.address,
 *   publicClient,
 * });
 */
export async function upgradeExecutorPrepareAddExecutorTransactionRequest({
  account,
  upgradeExecutorAddress,
  executorAccountAddress,
  publicClient,
}: UpgradeExecutorPrepareAddExecutorTransactionRequestParams) {
  const chainId = validateChain(publicClient);

  // 0. Verify that the account doesn't have the EXECUTOR role already
  const accountHasExecutorRole = await publicClient.readContract({
    address: upgradeExecutorAddress,
    abi: upgradeExecutor.abi,
    functionName: 'hasRole',
    args: [UPGRADE_EXECUTOR_ROLE_EXECUTOR, account],
  });
  if (accountHasExecutorRole) {
    throw new Error(`Account ${account} already has the Executor role`);
  }

  // 1. Encode the calldata to be sent in the transaction (through the UpgradeExecutor)
  const grantRoleCalldata = encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName: 'grantRole',
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
        grantRoleCalldata, // targetCallData
      ],
    }),
    account: executorAccountAddress,
  });

  return { ...request, chainId };
}
