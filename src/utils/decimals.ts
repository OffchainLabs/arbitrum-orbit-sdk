import { Address, Chain, PublicClient, Transport } from 'viem';
import utils from '@arbitrum/sdk/dist/lib/utils/lib';
import { publicClientToProvider } from '../ethers-compat/publicClientToProvider';
import { ArbitrumNetwork } from '@arbitrum/sdk';
import { BigNumber } from 'ethers';

export async function getNativeTokenDecimals<TChain extends Chain | undefined>({
  publicClient,
  nativeTokenAddress,
}: {
  publicClient: PublicClient<Transport, TChain>;
  nativeTokenAddress: Address;
}) {
  const result = await utils.getNativeTokenDecimals({
    childNetwork: {
      nativeToken: nativeTokenAddress,
    } as ArbitrumNetwork,
    parentProvider: publicClientToProvider(publicClient),
  });
  return BigInt(result.toString());
}

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
