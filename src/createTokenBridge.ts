import { Address, Chain, PrivateKeyAccount, PublicClient } from 'viem';
import {
  CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams,
  createTokenBridgeEnoughCustomFeeTokenAllowance,
} from './createTokenBridgeEnoughCustomFeeTokenAllowance';
import { createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest } from './createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest';
import { TokenBridgeContracts } from './types/TokenBridgeContracts';
import {
  TransactionRequestRetryableGasOverrides as TokenBridgeRetryableGasOverrides,
  createTokenBridgePrepareTransactionRequest,
} from './createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import {
  createTokenBridgePrepareSetWethGatewayTransactionRequest,
  TransactionRequestRetryableGasOverrides as SetWethGatewayRetryableGasOverrides,
} from './createTokenBridgePrepareSetWethGatewayTransactionRequest';
import { createTokenBridgePrepareSetWethGatewayTransactionReceipt } from './createTokenBridgePrepareSetWethGatewayTransactionReceipt';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { TransactionRequestGasOverrides } from './utils/gasOverrides';

function getBlockExplorerUrl(chain: Chain | undefined) {
  return chain?.blockExplorers?.default.url;
}

export type CreateTokenBridgeParams = WithTokenBridgeCreatorAddressOverride<{
  rollupOwner: PrivateKeyAccount;
  rollupAddress: Address;
  nativeTokenAddress?: Address;
  parentChainPublicClient: PublicClient;
  orbitChainPublicClient: PublicClient;
  gasOverrides?: TransactionRequestGasOverrides;
  retryableGasOverrides?: TokenBridgeRetryableGasOverrides;
  setWethGatewayGasOverrides?: SetWethGatewayRetryableGasOverrides;
}>;

/**
 * Performs the transactions to deploy the token bridge core contracts
 *
 * For chain with custom gas token, it checks the custom gas token allowance
 * token allowance and approve if necessary.
 *
 * Returns the token bridge core contracts.
 *
 * @param {CreateTokenBridgeParams} createTokenBridgeParams
 * @param {Object} createRollupParams.rollupOwner - The rollup owner private key account
 * @param {Object} createRollupParams.rollupAddress - The address of the Rollup contract
 * @param {String} createRollupParams.nativeTokenAddress - Optional
 * If nativeTokenAddress is passed and different than zero address, deploy a token bridge with custom fee token.
 * @param {Object} createRollupParams.parentChainPublicClient - The parent chain Viem Public Client
 * @param {Object} createRollupParams.orbitChainPublicClient - The orbit chain Viem Public Client
 * @param {String} createRollupParams.tokenBridgeCreatorAddressOverride - Optional
 * If tokenBridgeCreatorAddressOverride is passed, the address is overridden in the different transactions
 * @param {Object} createRollupParams.gasOverrides - {@link TransactionRequestGasOverrides} Optional
 * Gas overrides for createTokenBridgePrepareTransactionRequest
 * @param {Object} createRollupParams.retryableGasOverrides - {@link TokenBridgeRetryableGasOverrides} Optional
 * Retryable gas overrides for createTokenBridgePrepareTransactionRequest
 * @param {Object} createRollupParams.setWethGatewayGasOverrides - {@link SetWethGatewayRetryableGasOverrides} Optional
 * Retryable gas overrides for createTokenBridgePrepareSetWethGatewayTransactionRequest
 * @returns Promise<{@link TokenBridgeContracts}> - The token bridge core contracts.
 *
 * @example
 * const tokenBridgeCreator = await deployTokenBridgeCreator({
 *   publicClient: l2Client,
 * });
 *
 * const tokenBridgeContracts = await createTokenBridge({
 *   rollupOwner: rollupOwner,
 *   rollupAddress: rollupAddress,
 *   parentChainPublicClient: l1Client,
 *   orbitChainPublicClient: l2Client,
 *   tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
 *   gasOverrides: {
 *     gasLimit: {
 *       base: 6_000_000n,
 *     },
 *   },
 *   retryableGasOverrides: {
 *     maxGasForFactory: {
 *       base: 20_000_000n,
 *     },
 *     maxGasForContracts: {
 *       base: 20_000_000n,
 *     },
 *     maxSubmissionCostForFactory: {
 *       base: 4_000_000_000_000n,
 *     },
 *     maxSubmissionCostForContracts: {
 *       base: 4_000_000_000_000n,
 *     },
 *   },
 *   setWethGatewayGasOverrides: {
 *     gasLimit: {
 *       base: 100_000n,
 *     },
 *   },
 * });
 */
export async function createTokenBridge({
  rollupOwner,
  rollupAddress,
  nativeTokenAddress,
  parentChainPublicClient,
  orbitChainPublicClient,
  tokenBridgeCreatorAddressOverride,
  gasOverrides,
  retryableGasOverrides,
  setWethGatewayGasOverrides,
}: CreateTokenBridgeParams): Promise<TokenBridgeContracts> {
  const isCustomFeeTokenBridge = isCustomFeeTokenAddress(nativeTokenAddress);
  if (isCustomFeeTokenBridge) {
    // set the custom fee token
    // prepare transaction to approve custom fee token spend
    const allowanceParams: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams = {
      nativeToken: nativeTokenAddress,
      owner: rollupOwner.address,
      publicClient: parentChainPublicClient,
      tokenBridgeCreatorAddressOverride,
    };

    // Check allowance and approve if necessary
    if (!(await createTokenBridgeEnoughCustomFeeTokenAllowance(allowanceParams))) {
      const approvalTxRequest =
        await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(allowanceParams);

      // sign and send the transaction
      const approvalTxHash = await parentChainPublicClient.sendRawTransaction({
        serializedTransaction: await rollupOwner.signTransaction(approvalTxRequest),
      });

      // get the transaction receipt after waiting for the transaction to complete
      const approvalTxReceipt = await parentChainPublicClient.waitForTransactionReceipt({
        hash: approvalTxHash,
      });

      console.log(
        `Tokens approved in ${getBlockExplorerUrl(parentChainPublicClient.chain)}/tx/${
          approvalTxReceipt.transactionHash
        }`,
      );
    }
  }

  // prepare the transaction for deploying the core contracts
  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: {
      rollup: rollupAddress,
      rollupOwner: rollupOwner.address,
    },
    parentChainPublicClient,
    orbitChainPublicClient,
    account: rollupOwner.address,
    tokenBridgeCreatorAddressOverride,
    gasOverrides,
    retryableGasOverrides,
  });

  // sign and send the transaction
  console.log(`Deploying the TokenBridge...`);
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await rollupOwner.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
  );
  console.log(
    `Deployed in ${getBlockExplorerUrl(parentChainPublicClient.chain)}/tx/${
      txReceipt.transactionHash
    }`,
  );

  // wait for retryables to execute
  console.log(`Waiting for retryable tickets to execute on the Orbit chain...`);
  const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
    orbitPublicClient: orbitChainPublicClient,
  });
  console.log(`Retryables executed`);
  console.log(
    `Transaction hash for first retryable is ${orbitChainRetryableReceipts[0].transactionHash}`,
  );
  console.log(
    `Transaction hash for second retryable is ${orbitChainRetryableReceipts[1].transactionHash}`,
  );

  // fetching the TokenBridge contracts
  const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
    parentChainPublicClient,
  });

  // Non custom fee token
  if (!isCustomFeeTokenBridge) {
    // set weth gateway
    const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
      rollup: rollupAddress,
      parentChainPublicClient,
      orbitChainPublicClient,
      account: rollupOwner.address,
      tokenBridgeCreatorAddressOverride,
      ...setWethGatewayGasOverrides,
    });

    // sign and send the transaction
    const setWethGatewayTxHash = await parentChainPublicClient.sendRawTransaction({
      serializedTransaction: await rollupOwner.signTransaction(setWethGatewayTxRequest),
    });

    // get the transaction receipt after waiting for the transaction to complete
    const setWethGatewayTxReceipt = createTokenBridgePrepareSetWethGatewayTransactionReceipt(
      await parentChainPublicClient.waitForTransactionReceipt({ hash: setWethGatewayTxHash }),
    );

    console.log(
      `Weth gateway set in ${getBlockExplorerUrl(parentChainPublicClient.chain)}/tx/${
        setWethGatewayTxReceipt.transactionHash
      }`,
    );

    // Wait for retryables to execute
    const orbitChainSetWethGatewayRetryableReceipt =
      await setWethGatewayTxReceipt.waitForRetryables({
        orbitPublicClient: orbitChainPublicClient,
      });
    console.log(`Retryables executed`);
    console.log(
      `Transaction hash for retryable is ${orbitChainSetWethGatewayRetryableReceipt[0].transactionHash}`,
    );
    if (orbitChainSetWethGatewayRetryableReceipt[0].status !== 'success') {
      throw new Error(
        `Retryable status is not success: ${orbitChainSetWethGatewayRetryableReceipt[0].status}. Aborting...`,
      );
    }
  }

  return tokenBridgeContracts;
}
