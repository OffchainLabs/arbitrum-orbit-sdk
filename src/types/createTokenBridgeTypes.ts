import { Address } from 'viem';

export type WithTokenBridgeCreatorAddressOverride<T> = T & {
  /**
   * Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.
   */
  tokenBridgeCreatorAddressOverride?: Address;
};
