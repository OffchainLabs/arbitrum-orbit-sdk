import { Abi } from 'viem';

// https://twitter.com/mattpocockuk/status/1622730173446557697
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type GetFunctionName<TAbi extends Abi> = Extract<TAbi[number], { type: 'function' }>['name'];

/**
 * Creates a new type by making the specified keys required while keeping the remaining keys optional.
 *
 * @template T - The original object type.
 * @template K - The keys in `T` that should be required in the resulting type.
 *
 * @example
 * type Original = {
 *   a: number;
 *   b: string;
 *   c: boolean;
 * };
 *
 * type RequiredAandB = RequireSome<Original, 'a' | 'b'>;
 * // Resulting type:
 * // {
 * //   a: number;  // Required
 * //   b: string;  // Required
 * //   c?: boolean; // Optional
 * //}
 */
export type RequireSome<T, K extends keyof T> = Prettify<
  {
    [P in K]: T[P];
  } & {
    [P in Exclude<keyof T, K>]?: T[P];
  }
>;
