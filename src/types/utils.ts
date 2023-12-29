import { Abi } from 'viem';

// https://twitter.com/mattpocockuk/status/1622730173446557697
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type GetFunctionName<TAbi extends Abi> = Extract<TAbi[number], { type: 'function' }>['name'];
