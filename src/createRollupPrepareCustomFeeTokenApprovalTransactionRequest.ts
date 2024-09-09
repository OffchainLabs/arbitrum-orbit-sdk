import { Address, PublicClient, Transport, Chain } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validateParentChain } from './types/ParentChain';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { createRollupDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams<
  TChain extends Chain | undefined,
> = Prettify<
  WithRollupCreatorAddressOverride<{
    amount?: bigint;
    nativeToken: Address;
    account: Address;
    publicClient: PublicClient<Transport, TChain>;
  }>
>;

export async function createRollupPrepareCustomFeeTokenApprovalTransactionRequest<
  TChain extends Chain | undefined,
>({
  amount = createRollupDefaultRetryablesFees,
  nativeToken,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams<TChain>) {
  const chainId = validateParentChain(publicClient);

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
