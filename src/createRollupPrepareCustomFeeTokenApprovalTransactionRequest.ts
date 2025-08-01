import { Address, PublicClient, Transport, Chain } from 'viem';

import { approvePrepareTransactionRequest, fetchDecimals } from './utils/erc20';
import { validateParentChain } from './types/ParentChain';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';

import { Prettify } from './types/utils';
import { createRollupGetRetryablesFeesWithDefaults } from './createRollupGetRetryablesFees';
import { scaleFrom18DecimalsToNativeTokenDecimals } from './utils/decimals';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams<
  TChain extends Chain | undefined,
> = Prettify<{
  amount?: bigint;
  nativeToken: Address;
  maxFeePerGasForRetryables?: bigint;
  account: Address;
  publicClient: PublicClient<Transport, TChain>;
  rollupCreatorAddressOverride?: Address;
}>;

export async function createRollupPrepareCustomFeeTokenApprovalTransactionRequest<
  TChain extends Chain | undefined,
>({
  amount,
  nativeToken,
  maxFeePerGasForRetryables,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams<TChain>) {
  const { chainId } = validateParentChain(publicClient);

  const fees = await createRollupGetRetryablesFeesWithDefaults(publicClient, {
    account,
    nativeToken,
    maxFeePerGasForRetryables,
  });

  const decimals = await fetchDecimals({
    address: nativeToken,
    publicClient,
  });

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    amount: amount ?? scaleFrom18DecimalsToNativeTokenDecimals({ amount: fees, decimals }),
    publicClient,
  });

  return { ...request, chainId };
}
