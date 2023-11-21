import { Address, zeroAddress } from 'viem';

export function isCustomFeeTokenAddress(nativeToken: Address | undefined) {
  return typeof nativeToken !== 'undefined' && nativeToken !== zeroAddress;
}
