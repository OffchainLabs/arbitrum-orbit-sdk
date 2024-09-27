import { Address, PublicClient, Transport, Chain } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validateParentChain } from './types/ParentChain';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { createRollupDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';
import { createRollupGetRetryablesFees } from './createRollupGetRetryablesFees';

async function getFees<TChain extends Chain | undefined>({
  publicClient,
  nativeToken,
  maxFeePerGasForRetryables,
}: {
  publicClient: PublicClient<Transport, TChain>;
  nativeToken: Address;
  maxFeePerGasForRetryables?: bigint;
}): Promise<bigint> {
  try {
    return await createRollupGetRetryablesFees(publicClient, {
      nativeToken,
      maxFeePerGasForRetryables,
    });
  } catch (error) {
    console.error(
      '[createRollupPrepareCustomFeeTokenApprovalTransactionRequest] failed to fetch retryables fees, using defaults.',
    );
    return createRollupDefaultRetryablesFees;
  }
}

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

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    amount: amount ?? (await getFees({ publicClient, nativeToken, maxFeePerGasForRetryables })),
    publicClient,
  });

  return { ...request, chainId };
}
