import { PublicClient, WalletClient } from 'viem';

import { upgradeExecutor } from './contracts';
import { validateParentChain } from './types/ParentChain';
import { CoreContracts } from './types/CoreContracts';
import { setValidKeysetEncodeFunctionData } from './setValidKeysetEncodeFunctionData';

export type SetValidKeysetParams = {
  coreContracts: Pick<CoreContracts, 'upgradeExecutor' | 'sequencerInbox'>;
  keyset: `0x${string}`;
  publicClient: PublicClient;
  walletClient: WalletClient;
};

export async function setValidKeyset({
  coreContracts,
  keyset,
  publicClient,
  walletClient,
}: SetValidKeysetParams) {
  validateParentChain(publicClient);
  const account = walletClient.account?.address;

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const { request } = await publicClient.simulateContract({
    address: coreContracts.upgradeExecutor,
    abi: upgradeExecutor.abi,
    functionName: 'executeCall',
    args: [
      coreContracts.sequencerInbox, // target
      setValidKeysetEncodeFunctionData(keyset), // targetCallData
    ],
    account,
  });

  const hash = await walletClient.writeContract(request);
  const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

  return txReceipt;
}
