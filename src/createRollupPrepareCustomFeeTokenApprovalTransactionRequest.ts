import { Address, PublicClient, Transport, Chain } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validateParentChain } from './types/ParentChain';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';
import { createRollupGetRetryablesFeesWithDefaults } from './createRollupGetRetryablesFees';
import { applyPercentIncrease } from './utils/gasOverrides';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams<
  TChain extends Chain | undefined,
> = Prettify<
  WithRollupCreatorAddressOverride<{
    amount?: bigint;
    nativeToken: Address;
    maxFeePerGasForRetryables?: bigint;
    account: Address;
    publicClient: PublicClient<Transport, TChain>;
  }>
>;

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
  const chainId = validateParentChain(publicClient);

  const fees = await createRollupGetRetryablesFeesWithDefaults(publicClient, {
    account,
    nativeToken,
    maxFeePerGasForRetryables,
  });

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    amount: amount ?? fees,
    publicClient,
  });

  return { ...request, chainId };
}
