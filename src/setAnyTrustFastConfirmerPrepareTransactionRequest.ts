import {
  Address,
  Chain,
  PrivateKeyAccount,
  PublicClient,
  Transport,
  encodeFunctionData,
  parseAbi,
} from 'viem';
import { validateChain } from './utils/validateChain';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';

/**
 * This type is for the parameters of the setAnyTrustFastConfirmerPrepareTransactionRequest function
 */
export type SetAnyTrustFastConfirmerPrepareTransactionRequestParams<
  TChain extends Chain | undefined,
> = {
  publicClient: PublicClient<Transport, TChain>;
  account: Address;
  rollup: Address;
  upgradeExecutor: Address;
  fastConfirmer: Address;
};

/**
 * Prepares the transaction to set the AnyTrust fast confirmer address in the rollup contract
 *
 * Returns the transaction to sign and send to the blockchain.
 *
 * @param {SetAnyTrustFastConfirmerPrepareTransactionRequestParams} setAnyTrustFastConfirmerPrepareTransactionRequestParams {@link SetAnyTrustFastConfirmerPrepareTransactionRequestParams}
 * @param {PublicClient} setAnyTrustFastConfirmerPrepareTransactionRequestParams.publicClient - A Viem Public Client
 * @param {PrivateKeyAccount | `0x${string}`} setAnyTrustFastConfirmerPrepareTransactionRequestParams.account - The private key of the deployer of the new Safe or the address of the Safe
 * @param {Address} setAnyTrustFastConfirmerPrepareTransactionRequestParams.rollup - Address of the Rollup contract
 * @param {Address} setAnyTrustFastConfirmerPrepareTransactionRequestParams.upgradeExecutor - Address of the UpgradeExecutor contract
 * @param {Address} setAnyTrustFastConfirmerPrepareTransactionRequestParams.fastConfirmer - Address of the fast confirmer validator (usually a Safe multisig)
 *
 * @returns Promise<{@link TransactionRequest}> - the transaction to sign and send to the blockchain.
 */
export async function setAnyTrustFastConfirmerPrepareTransactionRequest<
  TChain extends Chain | undefined,
>({
  publicClient,
  account,
  rollup,
  upgradeExecutor,
  fastConfirmer,
}: SetAnyTrustFastConfirmerPrepareTransactionRequestParams<TChain>) {
  const chainId = validateChain(publicClient);

  // prepare the rollup transaction calldata
  const setAnyTrustFastConfirmerCalldata = encodeFunctionData({
    abi: parseAbi(['function setAnyTrustFastConfirmer(address _anyTrustFastConfirmer)']),
    functionName: 'setAnyTrustFastConfirmer',
    args: [fastConfirmer],
  });

  // prepare the transaction request
  // @ts-ignore (todo: fix viem type issue)
  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        rollup, // target
        setAnyTrustFastConfirmerCalldata, // targetCallData
      ],
    }),
    account,
  });

  return { ...request, chainId };
}
