import { Address, Chain, PrivateKeyAccount, PublicClient, zeroAddress } from 'viem';

import { CoreContracts } from './types/CoreContracts';
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
import { CreateRollupParams } from './types/createRollupTypes';

type PublicClientWithDefinedChain = Omit<PublicClient, 'chain'> & {
  chain: Chain;
};

type EnsureCustomGasTokenAllowanceGrantedToRollupCreatorParams = {
  nativeToken: Address;
  parentChainPublicClient: PublicClientWithDefinedChain;
  rollupOwner: PrivateKeyAccount;
};

/**
 * Check if the Rollup Creator address has been granted enough
 * allowance by the rollupOwner address to spend the custom fee token to
 * pay for the rollup creation retryable ticket.
 *
 * If not, perform an approval transaction to grant the custom fee token
 * spend allowance to the Rollup Creator address.
 */
async function ensureCustomGasTokenAllowanceGrantedToRollupCreator({
  nativeToken,
  parentChainPublicClient,
  rollupOwner,
}: EnsureCustomGasTokenAllowanceGrantedToRollupCreatorParams) {
  const allowanceParams = {
    nativeToken,
    account: rollupOwner.address,
    publicClient: parentChainPublicClient,
  };

  if (!(await createRollupEnoughCustomFeeTokenAllowance(allowanceParams))) {
    const approvalTxRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest(
      allowanceParams,
    );

    // sign and send the transaction
    const approvalTxHash = await parentChainPublicClient.sendRawTransaction({
      serializedTransaction: await rollupOwner.signTransaction(approvalTxRequest),
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

/**
 * This type is for the params of the createRollup function

 */
export type CreateRollupFunctionParams = CreateRollupParams & {
  rollupOwner: PrivateKeyAccount;
  parentChainPublicClient: PublicClient;
};

/**
 * @param {Object} createRollupResults - results of the createRollup function
 * @param {Object} createRollupResults.transaction - the transaction for deploying the core contracts
 * @param {Object} createRollupResults.txReceipt - the transaction receipt
 * @param {Object} createRollupResults.coreContracts - the core contracts
 */
export type CreateRollupResults = {
  transaction: CreateRollupTransaction;
  transactionReceipt: CreateRollupTransactionReceipt;
  coreContracts: CoreContracts;
};

/**
 * Performs the tx to deploy the chain's core contracts.
 *
 * Before creating a custom gas token chain, it checks the custom gas
 * token allowance granted to the rollup creator contract. Runs an approval
 * tx for insufficient allowance.
 *
 * Accepts rollup creation config, rollup owner, and the parent chain public client.
 *
 * Returns the transaction, the transaction receipt, and the core contracts.
 *
 * - Example 1: [Create an ETH gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-eth/index.ts)
 * - Example 2: [Create a custom gas token chain](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/create-rollup-custom-fee-token/index.ts)
 *
 * @param {CreateRollupFunctionParams} createRollupFunctionParams {@link CreateRollupFunctionParams}
 * @param {Object} createRollupFunctionParams.config - The chain config
 * @param {string} createRollupFunctionParams.batchPoster - The batchPoster address
 * @param {Array<string>} createRollupFunctionParams.validators - The validator(s) address array
 * @param {boolean} [createRollupFunctionParams.deployFactoriesToL2=] - Optional, defaults to true.
 * Deploying factories via retryable tickets at rollup creation time is the most reliable method to
 * do it since it doesn't require paying the L1 gas. If deployment is not done as part of rollup
 * creation TX, there is a risk that anyone can try to deploy factories and potentially burn
 * the nonce 0 (ie. due to gas price spike when doing direct child chain TX). That would mean we
 * permanently lost capability to deploy deterministic factory at expected address.
 * @param {string} [createRollupFunctionParams.nativeToken=] - The native token address, optional, defaults to ETH
 * @param {number} [createRollupFunctionParams.maxDataSize=] - The max calldata size, optional, defaults to 104_857 B for Orbit chains
 * @param {number} [createRollupFunctionParams.maxFeePerGasForRetryables=] - The max fee per gas for retryables, optional, defaults to 0.1 gwei
 * @param {Object} createRollupFunctionParams.rollupOwner - The rollup owner private key account
 * @param {Object} createRollupFunctionParams.parentChainPublicClient - The parent chain Viem Public Client
 *
 * @returns Promise<{@link CreateRollupResults}> - the transaction, the transaction receipt, and the core contracts.
 *
 * @example
 * const createRollupConfig = createRollupPrepareConfig({
 *   chainId: BigInt(chainId),
 *   owner: deployer.address,
 *   chainConfig: prepareChainConfig({
 *     chainId,
 *     arbitrum: {
 *       InitialChainOwner: deployer.address,
 *       DataAvailabilityCommittee: true,
 *     },
 *   }),
 * });
 *
 * const {
 *   transaction,
 *   transactionReceipt,
 *   coreContracts,
 * } = await createRollup({
 *   config: createRollupConfig,
 *   rollupOwner: deployer,
 *   batchPoster,
 *   validators,
 *   parentChainPublicClient,
 * });
 */
export async function createRollup({
  rollupOwner,
  parentChainPublicClient,
  ...params
}: CreateRollupFunctionParams): Promise<CreateRollupResults> {
  const parentChain = parentChainPublicClient.chain;

  if (!parentChain) {
    throw new Error('`parentChain` is not defined');
  }

  const nativeToken = params.nativeToken ?? zeroAddress;

  if (nativeToken !== zeroAddress) {
    // check Rollup Creator custom gas token spending allowance and approve if necessary
    await ensureCustomGasTokenAllowanceGrantedToRollupCreator({
      nativeToken,
      parentChainPublicClient: parentChainPublicClient as PublicClientWithDefinedChain,
      rollupOwner,
    });
  }

  // prepare the transaction for deploying the core contracts
  const txRequest = await createRollupPrepareTransactionRequest({
    params,
    account: rollupOwner.address,
    publicClient: parentChainPublicClient,
  });

  // sign and send the transaction
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await rollupOwner.signTransaction(txRequest),
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
    transaction: tx,
    transactionReceipt: txReceipt,
    coreContracts,
  };
}
