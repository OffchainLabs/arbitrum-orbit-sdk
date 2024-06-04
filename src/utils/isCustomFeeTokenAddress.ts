import { Address, zeroAddress } from 'viem';

/**
 * Checks if the provided token address is a custom fee token address. It
 * returns a {@link Address}.
 */
export function isCustomFeeTokenAddress(nativeToken: Address | undefined): nativeToken is Address {
  return typeof nativeToken !== 'undefined' && nativeToken !== zeroAddress;
}
