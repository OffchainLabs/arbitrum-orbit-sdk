import { BigNumber } from 'ethers';
import utils from '@arbitrum/sdk/dist/lib/utils/lib';

export function scaleToNativeTokenDecimals({
  amount,
  decimals,
}: {
  amount: bigint;
  decimals: number;
}) {
  const amountBigNumber = BigNumber.from(amount);
  const result = utils.scaleToNativeTokenDecimals({ amount: amountBigNumber, decimals });
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
  const result = utils.nativeTokenDecimalsTo18Decimals({ amount: amountBigNumber, decimals });
  return BigInt(result.toString());
}
