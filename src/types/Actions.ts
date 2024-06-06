import { Address } from 'viem';
import { Prettify } from './utils';

type RemoveUndefinedArgs<T> = T extends { args?: undefined } ? Omit<T, 'args'> : T;

/**
 * If the function has no args, `GetFunctionArgs` returns `{ args?: undefined }`
 * we remove args from the returned type
 *
 * Contract address is required if no contract address was passed to the actions, otherwise it's optional
 */
export type WithContractAddress<
  Args,
  ContractName extends string,
  Curried extends boolean = false,
> = Prettify<
  RemoveUndefinedArgs<
    Args &
      (Curried extends true
        ? {
            [key in ContractName]?: Address;
          }
        : { [key in ContractName]: Address })
  >
>;

/**
 * Actions require contract address, but as part of decorators, the address might have been passed already to the decorator.
 *
 * If the address was passed to the decorator, it's now optional (we still allow overrides of the address per action).
 * If the action doesn't have any other parameters beside the contract address, then parameters can either be { contract: address } or void
 */
export type ActionParameters<Args, ContractName extends string, Curried extends boolean> = Prettify<
  Curried extends false
    ? RemoveUndefinedArgs<Args & { sequencerInbox: Address }>
    : Args extends { args?: undefined }
    ?
        | {
            [key in ContractName]: Address;
          }
        | void
    : Args & {
        [key in ContractName]?: Address;
      }
>;

export type WithAccount<Args> = Args & {
  account: Address;
};
