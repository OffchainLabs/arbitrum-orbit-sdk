import { Abi } from 'viem';
import { arbOwner } from '../contracts';

// https://twitter.com/mattpocockuk/status/1622730173446557697
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type GetFunctionName<TAbi extends Abi> = Extract<
  TAbi[number],
  { type: 'function' }
>['name'];

export type ExtractReadFunctionsFromAbi<TAbi extends Abi> = Extract<
  TAbi[number],
  { type: 'function'; stateMutability: 'view' | 'pure' }
>[];

export type ExtractWriteFunctionsFromAbi<TAbi extends Abi> = Extract<
  TAbi[number],
  { type: 'function'; stateMutability: 'nonpayable' | 'payable' }
>[];

type X = GetFunctionName<ExtractReadFunctionsFromAbi<typeof arbOwner.abi>>;
type Y = GetFunctionName<ExtractWriteFunctionsFromAbi<typeof arbOwner.abi>>;
