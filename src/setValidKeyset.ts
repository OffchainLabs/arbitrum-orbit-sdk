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

/**
 * Sets the valid keyset for a contract on the parent chain.
 *
 * @param {SetValidKeysetParams} setValidKeysetParams - The parameters for setting the valid keyset.
 * @param {Object} setValidKeysetParams.coreContracts - The core contracts involved in the operation.
 * @param {string} setValidKeysetParams.coreContracts.upgradeExecutor - The address of the upgrade executor contract.
 * @param {string} setValidKeysetParams.coreContracts.sequencerInbox - The address of the sequencer inbox contract.
 * @param {string} setValidKeysetParams.keyset - The keyset to be set, represented as a hex string.
 * @param {PublicClient} setValidKeysetParams.publicClient - The public client for interacting with the blockchain.
 * @param {WalletClient} setValidKeysetParams.walletClient - The wallet client for signing and sending transactions.
 *
 * @returns {Promise<TransactionReceipt>} The transaction receipt after setting the valid keyset.
 *
 * @throws Will throw an error if the account is undefined.
 *
 * @example
 * const txReceipt = await setValidKeyset({
 *   coreContracts: {
 *     upgradeExecutor: '0x123...456',
 *     sequencerInbox: '0x789...abc',
 *   },
 *   keyset: '0xdef...012',
 *   publicClient,
 *   walletClient,
 * });
 * console.log(txReceipt);
 */
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
