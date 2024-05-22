import { Address, PrepareTransactionRequestReturnType } from 'viem';

import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';

type SimplePrepareTransactionRequestReturnType = Pick<
  PrepareTransactionRequestReturnType,
  'to' | 'data'
>;

export function withUpgradeExecutor<
  TTransactionRequest extends SimplePrepareTransactionRequestReturnType,
>({
  transactionRequest,
  upgradeExecutor,
}: {
  transactionRequest: TTransactionRequest;
  upgradeExecutor: Address;
}): TTransactionRequest {
  const data = upgradeExecutorEncodeFunctionData({
    functionName: 'executeCall',
    args: [
      transactionRequest.to!, // target
      transactionRequest.data!, // targetCallData
    ],
  });

  return { ...transactionRequest, data, to: upgradeExecutor };
}
