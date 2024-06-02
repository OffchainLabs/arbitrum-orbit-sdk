import { Address, zeroAddress } from 'viem';

/**
 * Returns true if the provided address is not undefined and not equal to
 * zeroAddress, indicating that it is a custom fee token address.
 *
 * @param {Address | undefined} nativeToken - The address to check.
 * @returns {boolean} - True if the address is a custom fee token address, false otherwise.
 */
export function isCustomFeeTokenAddress(nativeToken: Address | undefined): nativeToken is Address {
  return typeof nativeToken !== 'undefined' && nativeToken !== zeroAddress;
}
