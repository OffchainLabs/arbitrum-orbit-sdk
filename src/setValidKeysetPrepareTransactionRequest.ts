import { Address } from 'viem';

import { validParentChainId } from './types/ParentChain';
import { executeCallEncodeFunctionData } from './executeCallEncodeFunctionData';
import { SetValidKeysetParams } from './setValidKeyset';
import { setValidKeysetEncodeFunctionData } from './setValidKeysetEncodeFunctionData';

export type SetValidKeysetPrepareTransactionRequestParams = Omit<
  SetValidKeysetParams,
  'walletClient'
> & {
  account: Address;
};

export async function setValidKeysetPrepareTransactionRequest({
  coreContracts,
  keyset,
  account,
  publicClient,
}: SetValidKeysetPrepareTransactionRequestParams) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: coreContracts.upgradeExecutor,
    data: executeCallEncodeFunctionData([
      coreContracts.sequencerInbox,
      setValidKeysetEncodeFunctionData(keyset),
    ]),
    account,
  });

  return { ...request, chainId };
}
