import { Address, Chain, PrivateKeyAccount, PublicClient } from 'viem';

import { prepareChainConfig } from './prepareChainConfig';
import { CoreContracts } from './types/CoreContracts';
import {
  CreateRollupPrepareConfigResult,
  createRollupPrepareConfig,
} from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import {
  CreateRollupTransactionReceipt,
  createRollupPrepareTransactionReceipt,
} from './createRollupPrepareTransactionReceipt';
import { createRollupEnoughCustomFeeTokenAllowance } from './createRollupEnoughCustomFeeTokenAllowance';
import { createRollupPrepareCustomFeeTokenApprovalTransactionRequest } from './createRollupPrepareCustomFeeTokenApprovalTransactionRequest';
import { getBlockExplorerUrl } from './utils/getters';
import {
  CreateRollupTransaction,
  createRollupPrepareTransaction,
} from './createRollupPrepareTransaction';

type PublicClientWithDefinedChain = Omit<PublicClient, 'chain'> & {
  chain: Chain;
};

type EnsureCustomGasTokenAllowanceGrantedToRollupCreatorParams = {
  nativeToken: Address;
  parentChainPublicClient: PublicClientWithDefinedChain;
  deployer: PrivateKeyAccount;
};

/**
 * Check if the Rollup Creator address has been granted enough
 * allowance by the deployer address to spend the custom fee token to
 * pay for the rollup creation retryable ticket.
 *
 * If not, perform an approval transaction to grant the custom fee token
 * spend allowance to the Rollup Creator address.
 */
async function ensureCustomGasTokenAllowanceGrantedToRollupCreator({
  nativeToken,
  parentChainPublicClient,
  deployer,
}: EnsureCustomGasTokenAllowanceGrantedToRollupCreatorParams) {
  const allowanceParams = {
    nativeToken,
    account: deployer.address,
    publicClient: parentChainPublicClient,
  };

  if (!(await createRollupEnoughCustomFeeTokenAllowance(allowanceParams))) {
    const approvalTxRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest(
      allowanceParams,
    );

    // sign and send the transaction
    const approvalTxHash = await parentChainPublicClient.sendRawTransaction({
      serializedTransaction: await deployer.signTransaction(approvalTxRequest),
    });

    // get the transaction receipt after waiting for the transaction to complete
    const approvalTxReceipt = createRollupPrepareTransactionReceipt(
      await parentChainPublicClient.waitForTransactionReceipt({
        hash: approvalTxHash,
      }),
    );

    console.log(
      `Tokens approved in ${getBlockExplorerUrl(parentChainPublicClient.chain)}/tx/${
        approvalTxReceipt.transactionHash
      }`,
    );
  }
}

export type CreateRollupParams = {
  chainId: number;
  deployer: PrivateKeyAccount;
  batchPoster: Address;
  validators: Address[];
  parentChainPublicClient: PublicClient;
  deployFactoriesToL2?: boolean;
  nativeToken?: Address | 'ETH';
};

/**
 * @param {Object} createRollupResults - results of the createRollup function
 * @param {Object} createRollupResults.config - the chain config
 * @param {Object} createRollupResults.transaction - the transaction for deploying the core contracts
 * @param {Object} createRollupResults.txReceipt - the transaction receipt
 * @param {Object} createRollupResults.coreContracts - the core contracts
 */
export type CreateRollupResults = {
  config: CreateRollupPrepareConfigResult;
  transaction: CreateRollupTransaction;
  transactionReceipt: CreateRollupTransactionReceipt;
  coreContracts: CoreContracts;
};

/**
 * @param {Object} createRollupParams
 * @param {number} createRollupParams.chainId - The chain ID of the AnyTrust chain
 * @param {Object} createRollupParams.deployer - The deployer private key account
 * @param {string} createRollupParams.batchPoster - The batchPoster address
 * @param {Array<string>} createRollupParams.validators - The validator(s) address array
 * @param {Object} createRollupParams.parentChainPublicClient - The parent chain viem Public Client
 * @param {boolean} [createRollupParams.deployFactoriesToL2=true] - Deploying factories via retryable tickets
 * at rollup creation time is the most reliable method to do it since it doesn't require paying the
 * L1 gas. If deployment is not done as part of rollup creation TX, there is a risk that
 * anyone can try to deploy factories and potentially burn the nonce 0 (ie. due to gas price
 * spike when doing direct child chain TX). That would mean we permanently lost capability to
 * deploy deterministic factory at expected address.
 * @param {string} [createRollupParams.nativeToken='ETH'] - The native token address or `ETH`, default value is `ETH`
 * @returns @param {Object} createRollupResults
 */
export async function createRollup({
  chainId,
  deployer,
  batchPoster,
  validators,
  parentChainPublicClient,
  deployFactoriesToL2 = true,
  nativeToken = 'ETH',
}: CreateRollupParams): Promise<CreateRollupResults> {
  const isCustomGasToken = nativeToken !== 'ETH';
  const parentChain = parentChainPublicClient.chain;

  if (!parentChain) {
    throw new Error('`parentChain` is not defined');
  }

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: {
      InitialChainOwner: deployer.address,
      DataAvailabilityCommittee: true,
    },
  });

  if (isCustomGasToken) {
    // check Rollup Creator custom gas token spending allowance and approve if necessary
    await ensureCustomGasTokenAllowanceGrantedToRollupCreator({
      nativeToken,
      parentChainPublicClient: parentChainPublicClient as PublicClientWithDefinedChain,
      deployer,
    });
  }

  // prepare config for rollup creation
  const config = createRollupPrepareConfig({
    chainId: BigInt(chainId),
    owner: deployer.address,
    chainConfig,
  });

  // prepare the transaction for deploying the core contracts
  const txRequest = await createRollupPrepareTransactionRequest({
    params: {
      config,
      batchPoster,
      validators,
      nativeToken: isCustomGasToken ? nativeToken : undefined,
      deployFactoriesToL2,
    },
    account: deployer.address,
    publicClient: parentChainPublicClient,
  });

  // sign and send the transaction
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(txRequest),
  });

  // get the transaction
  const tx = createRollupPrepareTransaction(
    await parentChainPublicClient.getTransaction({ hash: txHash }),
  );

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createRollupPrepareTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
  );

  console.log(`Deployed in ${getBlockExplorerUrl(parentChain)}/tx/${txReceipt.transactionHash}`);

  const coreContracts = txReceipt.getCoreContracts();

  return {
    config,
    transaction: tx,
    transactionReceipt: txReceipt,
    coreContracts,
  };
}
