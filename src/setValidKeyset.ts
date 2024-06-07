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
 * Sets a valid keyset for the core contracts.
 *
 * This function validates the parent chain, simulates the contract call, and writes the contract.
 * It then waits for the transaction receipt and returns it.
 *
 * @param {SetValidKeysetParams} setValidKeysetParams - The parameters for setting the valid keyset.
 * @param {Object} setValidKeysetParams.coreContracts - The core contracts involved in the operation.
 * @param {Object} setValidKeysetParams.coreContracts.upgradeExecutor - The upgrade executor contract.
 * @param {Object} setValidKeysetParams.coreContracts.sequencerInbox - The sequencer inbox contract.
 * @param {string} setValidKeysetParams.keyset - The keyset to be set, in hexadecimal format.
 * @param {Object} setValidKeysetParams.publicClient - The public client for interacting with the blockchain.
 * @param {Object} setValidKeysetParams.walletClient - The wallet client for signing transactions.
 *
 * @returns {Promise<Object>} The transaction receipt.
 *
 * @throws {Error} If the account is undefined.
 *
 * @example
 * const params = {
 *   coreContracts: {
 *     upgradeExecutor: '0x...',
 *     sequencerInbox: '0x...'
 *   },
 *   keyset: '0x1234...',
 *   publicClient: new PublicClient(),
 *   walletClient: new WalletClient()
 * };
 *
 * setValidKeyset(params).then(txReceipt => {
 *   console.log(txReceipt);
 * }).catch(error => {
 *   console.error(error);
 * });
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
