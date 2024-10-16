import { Address, Chain, PublicClient, Transport, zeroAddress } from 'viem';
import { fetchDecimals } from './erc20';

export async function getNativeTokenDecimals<TChain extends Chain | undefined>({
  publicClient,
  nativeTokenAddress,
}: {
  publicClient: PublicClient<Transport, TChain>;
  nativeTokenAddress: Address;
}) {
  if (!nativeTokenAddress || nativeTokenAddress === zeroAddress) {
    return 18;
  }

  try {
    return await fetchDecimals({ address: nativeTokenAddress, publicClient });
  } catch {
    return 0;
  }
}

export function scaleToNativeTokenDecimals({
  amount,
  decimals,
}: {
  amount: bigint;
  decimals: number;
}) {
  // do nothing for 18 decimals
  if (decimals === 18) {
    return amount;
  }

  const decimalsBigInt = BigInt(decimals);
  if (decimals < 18) {
    const divisor = 10n ** (18n - decimalsBigInt);
    const scaledAmount = amount / divisor;
    // round up if necessary
    if (scaledAmount * divisor < amount) {
      return scaledAmount + 1n;
    }

    return scaledAmount;
  }

  // decimals > 18
  return amount * 10n ** (decimalsBigInt - 18n);
}

export function nativeTokenDecimalsTo18Decimals({
  amount,
  decimals,
}: {
  amount: bigint;
  decimals: number;
}) {
  if (decimals < 18) {
    return amount * 10n ** BigInt(18 - decimals);
  } else if (decimals > 18) {
    return amount / 10n ** BigInt(decimals - 18);
  }

  return amount;
}
