import { BigNumber } from 'ethers';
import {
  scaleToNativeTokenDecimals as ethers_scaleToNativeTokenDecimals,
  nativeTokenDecimalsTo18Decimals as ethers_nativeTokenDecimalsTo18Decimals,
} from '@arbitrum/sdk/dist/lib/utils/lib';

export function scaleToNativeTokenDecimals({
  amount,
  decimals,
}: {
  amount: bigint;
  decimals: number;
}) {
  const amountBigNumber = BigNumber.from(amount);
  const result = ethers_scaleToNativeTokenDecimals({ amount: amountBigNumber, decimals });
  return BigInt(result.toString());
}

export function nativeTokenDecimalsTo18Decimals({
  amount,
  decimals,
}: {
  amount: bigint;
  decimals: number;
}) {
  const amountBigNumber = BigNumber.from(amount);
  const result = ethers_nativeTokenDecimalsTo18Decimals({ amount: amountBigNumber, decimals });
  return BigInt(result.toString());
}
