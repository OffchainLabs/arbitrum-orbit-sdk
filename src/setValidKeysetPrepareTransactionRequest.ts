import { Address } from 'viem';

import { validParentChainId } from './types/ParentChain';
import { SetValidKeysetParams } from './setValidKeyset';
import { setValidKeysetEncodeFunctionData } from './setValidKeysetEncodeFunctionData';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';

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
