import { Address, Chain, PrivateKeyAccount, PublicClient } from 'viem';
import {
  CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams,
  createTokenBridgeEnoughCustomFeeTokenAllowance,
} from './createTokenBridgeEnoughCustomFeeTokenAllowance';
import { createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest } from './createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest';
import { TokenBridgeContracts } from './types/TokenBridgeContracts';
import {
  CreateTokenBridgePrepareTransactionRequestParams,
  createTokenBridgePrepareTransactionRequest,
} from './createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import {
  CreateTokenBridgePrepareRegisterWethGatewayTransactionRequestParams,
  createTokenBridgePrepareSetWethGatewayTransactionRequest,
} from './createTokenBridgePrepareSetWethGatewayTransactionRequest';
import { createTokenBridgePrepareSetWethGatewayTransactionReceipt } from './createTokenBridgePrepareSetWethGatewayTransactionReceipt';

function getBlockExplorerUrl(chain: Chain | undefined) {
  return chain?.blockExplorers?.default.url;
}

export type CreateTokenBridgeParams = {
  rollupOwner: PrivateKeyAccount;
  rollupAddress: Address;
  nativeTokenAddress?: Address;
  parentChainPublicClient: PublicClient;
  orbitChainPublicClient: PublicClient;
  createTokenBridgeEnoughCustomFeeTokenAllowanceParamsOverride?: Partial<CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams>;
  createTokenBridgePrepareTransactionRequestParamsOverride?: Partial<CreateTokenBridgePrepareTransactionRequestParams>;
  createTokenBridgePrepareRegisterWethGatewayTransactionRequestParamsOverride?: Partial<CreateTokenBridgePrepareRegisterWethGatewayTransactionRequestParams>;
};

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
 * @param {Object} createRollupParams.nativeTokenAddress - Optional
 * If nativeTokenAddress is passed, deploy a token bridge with custom fee token.
 * @param {Object} createRollupParams.parentChainPublicClient - The parent chain Viem Public Client
 * @param {Object} createRollupParams.orbitChainPublicClient - The orbit chain Viem Public Client
 * @param {Object} createRollupParams.createTokenBridgeEnoughCustomFeeTokenAllowanceParamsOverride - Optional {@link CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams}
 * @param {Object} createRollupParams.createTokenBridgePrepareTransactionRequestParamsOverride - Optional {@link CreateTokenBridgePrepareTransactionRequestParams}
 * @param {Object} createRollupParams.createTokenBridgePrepareRegisterWethGatewayTransactionRequestParamsOverride - Optional {@link CreateTokenBridgePrepareSetWethGatewayTransactionRequestParams}
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
 *   createTokenBridgeEnoughCustomFeeTokenAllowanceParamsOverride: {
 *     tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
 *   },
 *   createTokenBridgePrepareTransactionRequestParamsOverride: {
 *     tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
 *   },
 *   createTokenBridgePrepareRegisterWethGatewayTransactionRequestParamsOverride: {
 *     tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
 *     retryableGasOverrides: {
 *       gasLimit: {
 *         base: 100_000n,
 *       }
 *     }
 *   }t
 * });
 */
export async function createTokenBridge({
  rollupOwner,
  rollupAddress,
  nativeTokenAddress,
  parentChainPublicClient,
  orbitChainPublicClient,
  createTokenBridgeEnoughCustomFeeTokenAllowanceParamsOverride,
  createTokenBridgePrepareTransactionRequestParamsOverride,
  createTokenBridgePrepareRegisterWethGatewayTransactionRequestParamsOverride,
}: CreateTokenBridgeParams): Promise<TokenBridgeContracts> {
  if (nativeTokenAddress) {
    // set the custom fee token
    // prepare transaction to approve custom fee token spend
    const allowanceParams: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams = {
      nativeToken: nativeTokenAddress,
      owner: rollupOwner.address,
      publicClient: parentChainPublicClient,
      ...createTokenBridgeEnoughCustomFeeTokenAllowanceParamsOverride,
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
    ...createTokenBridgePrepareTransactionRequestParamsOverride,
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
  if (!nativeTokenAddress) {
    // set weth gateway
    const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
      rollup: rollupAddress,
      parentChainPublicClient,
      orbitChainPublicClient,
      account: rollupOwner.address,
      ...createTokenBridgePrepareRegisterWethGatewayTransactionRequestParamsOverride,
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
