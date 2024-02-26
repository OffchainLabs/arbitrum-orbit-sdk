import { Address } from 'viem';

export type WithRollupCreatorAddressOverride<T> = T & {
  /**
   * Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.
   */
  rollupCreatorAddressOverride?: Address;
};
