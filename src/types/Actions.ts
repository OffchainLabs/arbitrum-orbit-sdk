import { Address } from 'viem';
import { Prettify } from './utils';

/**
 * Actions require contract address, but as part of decorators, the address might have been passed already to the decorator.
 *
 * If the address was passed to the decorator, it's now optional (we still allow overrides of the address per action).
 * If the action doesn't have any other parameters beside the contract address, then parameters can either be { contract: address } or void
 */
export type ActionParameters<Args, ContractName extends string, Curried extends boolean> = Prettify<
  Curried extends false
    ? Args & { [key in ContractName]: Address }
    : Args extends Record<string, never>
    ?
        | {
            [key in ContractName]: Address;
          }
        | void
    : Args & {
        [key in ContractName]?: Address;
      }
>;
