import { Abi, ContractFunctionName } from 'viem';

// https://twitter.com/mattpocockuk/status/1622730173446557697
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type GetReadContractFunctionName<TAbi extends Abi> = ContractFunctionName<
  TAbi,
  'pure' | 'view'
>;
export type GetPrepareTransactionRequestParams<TAbi extends Abi> = ContractFunctionName<
  TAbi,
  'nonpayable' | 'payable'
>;