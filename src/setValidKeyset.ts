import { PublicClient, WalletClient } from 'viem';

import { upgradeExecutorABI } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { CoreContracts } from './types/CoreContracts';
import { setValidKeysetEncodeFunctionData } from './setValidKeysetEncodeFunctionData';

export type SetValidKeysetParams = {
  coreContracts: Pick<CoreContracts, 'upgradeExecutor' | 'sequencerInbox'>;
  keyset: `0x${string}`;
  publicClient: PublicClient;
  walletClient: WalletClient;
};

export async function setValidKeyset({
  coreContracts: { upgradeExecutor, sequencerInbox },
  keyset,
  publicClient,
  walletClient,
}: SetValidKeysetParams) {
  const chainId = publicClient.chain?.id;
  const account = walletClient.account?.address;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const { request } = await publicClient.simulateContract({
    address: upgradeExecutor,
    abi: upgradeExecutorABI,
    functionName: 'executeCall',
    args: [
      sequencerInbox, // target
      setValidKeysetEncodeFunctionData(keyset), // targetCallData
    ],
    account,
  });

  const hash = await walletClient.writeContract(request);
  const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

  return txReceipt;
}
