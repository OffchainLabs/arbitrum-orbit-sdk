import { Address, zeroAddress } from 'viem';

/**
 * Determines if the provided native token address is a custom fee token address.
 *
 * @param {Address | undefined} nativeToken - The native token address to check.
 * @returns {boolean} - Returns true if the native token address is defined and not equal to the zero address.
 */
export function isCustomFeeTokenAddress(nativeToken: Address | undefined): nativeToken is Address {
  return typeof nativeToken !== 'undefined' && nativeToken !== zeroAddress;
}
