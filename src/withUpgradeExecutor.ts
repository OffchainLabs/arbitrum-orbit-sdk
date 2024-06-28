import { Address, PrepareTransactionRequestReturnType } from 'viem';

import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';

type SimplePrepareTransactionRequestReturnType = Pick<
  PrepareTransactionRequestReturnType,
  'to' | 'data'
>;

export function withUpgradeExecutor<
  TTransactionRequest extends SimplePrepareTransactionRequestReturnType,
>(
  transactionRequest: TTransactionRequest,
  {
    upgradeExecutor,
    upgradeExecutorFunctionName = 'executeCall',
  }: {
    upgradeExecutor: Address;
    upgradeExecutorFunctionName?: 'execute' | 'executeCall';
  },
): TTransactionRequest {
  const data = upgradeExecutorEncodeFunctionData({
    functionName: upgradeExecutorFunctionName,
    args: [
      transactionRequest.to!, // target
      transactionRequest.data!, // targetCallData
    ],
  });

  return { ...transactionRequest, to: upgradeExecutor, data };
}
