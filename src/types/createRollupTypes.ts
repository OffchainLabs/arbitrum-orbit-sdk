import { AbiStateMutability, Address, ContractFunctionArgs } from 'viem';

import { rollupCreator } from '../contracts';

export type CreateRollupFunctionInputs = ContractFunctionArgs<
  typeof rollupCreator.abi,
  AbiStateMutability,
  'createRollup'
>;

type RequiredKeys = 'config' | 'batchPoster' | 'validators';

export type CreateRollupParams = Pick<CreateRollupFunctionInputs[0], RequiredKeys> &
  Partial<Omit<CreateRollupFunctionInputs[0], RequiredKeys>>;

export type WithRollupCreatorAddressOverride<T> = T & {
  /**
   * Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.
   */
  rollupCreatorAddressOverride?: Address;
};
