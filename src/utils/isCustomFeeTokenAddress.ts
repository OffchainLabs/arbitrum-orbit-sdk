import { Address, zeroAddress } from 'viem';

export function isCustomFeeTokenAddress(nativeToken: Address | undefined): nativeToken is Address {
  return typeof nativeToken !== 'undefined' && nativeToken !== zeroAddress;
}
