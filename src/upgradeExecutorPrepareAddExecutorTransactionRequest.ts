import { Address, PublicClient, encodeFunctionData } from 'viem';
import { upgradeExecutor } from './contracts';
import {
  UPGRADE_EXECUTOR_ROLE_EXECUTOR,
  upgradeExecutorEncodeFunctionData,
} from './upgradeExecutorEncodeFunctionData';

export type UpgradeExecutorPrepareAddExecutorTransactionRequestParams = {
  account: Address;
  upgradeExecutorAddress: Address;
  executorAccountAddress: Address;
  publicClient: PublicClient;
};

export async function upgradeExecutorPrepareAddExecutorTransactionRequest({
  account,
  upgradeExecutorAddress,
  executorAccountAddress,
  publicClient,
}: UpgradeExecutorPrepareAddExecutorTransactionRequestParams) {
  const chainId = publicClient.chain!.id;

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
