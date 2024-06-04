import { Address } from 'viem';

import { validateParentChain } from './types/ParentChain';
import { SetValidKeysetParams } from './setValidKeyset';
import { setValidKeysetEncodeFunctionData } from './setValidKeysetEncodeFunctionData';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';

export type SetValidKeysetPrepareTransactionRequestParams = Omit<
  SetValidKeysetParams,
  'walletClient'
> & {
  account: Address;
};

/**
 * setValidKeysetPrepareTransactionRequest prepares a transaction request to
 * update the valid keyset for a given account on a specified chain. It
 * validates the parent chain, encodes the function data for setting the valid
 * keyset, and returns the prepared transaction request along with the chain ID.
 */
export async function setValidKeysetPrepareTransactionRequest({
  coreContracts,
  keyset,
  account,
  publicClient,
}: SetValidKeysetPrepareTransactionRequestParams) {
  const chainId = validateParentChain(publicClient);

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: coreContracts.upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        coreContracts.sequencerInbox, // target
        setValidKeysetEncodeFunctionData(keyset), // targetCallData
      ],
    }),
    account,
  });

  return { ...request, chainId };
}
