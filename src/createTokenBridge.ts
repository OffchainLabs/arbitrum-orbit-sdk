import {
  Address,
  Chain,
  PrivateKeyAccount,
  PublicClient,
  Transport,
  Transaction,
  TransactionReceipt,
} from 'viem';
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
import {
  CreateTokenBridgeTransactionReceipt,
  WaitForRetryablesResult,
  createTokenBridgePrepareTransactionReceipt,
} from './createTokenBridgePrepareTransactionReceipt';
import {
  createTokenBridgePrepareSetWethGatewayTransactionRequest,
  TransactionRequestRetryableGasOverrides as SetWethGatewayRetryableGasOverrides,
} from './createTokenBridgePrepareSetWethGatewayTransactionRequest';
import {
  CreateTokenBridgeSetWethGatewayTransactionReceipt,
  createTokenBridgePrepareSetWethGatewayTransactionReceipt,
} from './createTokenBridgePrepareSetWethGatewayTransactionReceipt';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { TransactionRequestGasOverrides } from './utils/gasOverrides';
import { getBlockExplorerUrl } from './utils/getBlockExplorerUrl';
import { tokenBridgeCreatorABI } from './contracts/TokenBridgeCreator';
import { getTokenBridgeCreatorAddress } from './utils';
import { rollupABI } from './contracts/Rollup';

/**
 * If token bridge was already deployed, `createTokenBridge` will fail when waiting for retryables.
 * This function returns true if token bridge was deployed previously.
 *
 * @param {String} assertTokenBridgeDoesntExistParams.parentChainPublicClient - The parent chain Viem Public Client
 * @param {String} assertTokenBridgeDoesntExistParams.orbitChainPublicClient - The orbit chain Viem Public Client
 * @param {String=} assertTokenBridgeDoesntExistParams.tokenBridgeCreatorAddress - The TokenBridgeCreator address.
 * Default to getTokenBridgeCreatorAddress(parentChainPublicClient) if not provided
 * @param {String} assertTokenBridgeDoesntExistParams.rollupAddress - The address of the rollup on the parent chain
 *
 * @returns true if token bridge was already deployed
 */
export async function isTokenBridgeDeployed<
  TParentChain extends Chain | undefined,
  TOrbitChain extends Chain | undefined,
>({
  parentChainPublicClient,
  orbitChainPublicClient,
  tokenBridgeCreatorAddress,
  rollupAddress,
}: {
  parentChainPublicClient: PublicClient<Transport, TParentChain>;
  orbitChainPublicClient: PublicClient<Transport, TOrbitChain>;
  tokenBridgeCreatorAddress?: Address;
  rollupAddress: Address;
}) {
  const inbox = await parentChainPublicClient.readContract({
    address: rollupAddress,
    abi: rollupABI,
    functionName: 'inbox',
  });

  const [router] = await parentChainPublicClient.readContract({
    address: tokenBridgeCreatorAddress ?? getTokenBridgeCreatorAddress(parentChainPublicClient),
    abi: tokenBridgeCreatorABI,
    functionName: 'inboxToL2Deployment',
    args: [inbox],
  });

  if (router) {
    const code = await orbitChainPublicClient.getBytecode({ address: router });
    if (code) {
      return true;
    }
  }

  return false;
}

export type CreateTokenBridgeParams<
  TParentChain extends Chain | undefined,
  TOrbitChain extends Chain | undefined,
> = WithTokenBridgeCreatorAddressOverride<{
  rollupOwner: Address;
  rollupAddress: Address;
  account: PrivateKeyAccount;
  nativeTokenAddress?: Address;
  parentChainPublicClient: PublicClient<Transport, TParentChain>;
  orbitChainPublicClient: PublicClient<Transport, TOrbitChain>;
  gasOverrides?: TransactionRequestGasOverrides;
  retryableGasOverrides?: TokenBridgeRetryableGasOverrides;
  setWethGatewayGasOverrides?: SetWethGatewayRetryableGasOverrides;
}>;

export type CreateTokenBridgeResults<
  TParentChain extends Chain | undefined,
  TOrbitChain extends Chain | undefined,
> = {
  /**
   * Transaction of createTokenBridgePrepareTransactionRequest
   */
  transaction: Transaction;
  /**
   * Transaction receipt of createTokenBridgePrepareTransactionReceipt ({@link CreateTokenBridgeTransactionReceipt})
   */
  transactionReceipt: CreateTokenBridgeTransactionReceipt<TParentChain, TOrbitChain>;
  /**
   * Retryable transaction receipts of createTokenBridgePrepareTransactionReceipt ({@link WaitForRetryablesResult})
   */
  retryables: WaitForRetryablesResult;
  /**
   * Core token bridge contracts ({@link TokenBridgeContracts})
   */
  tokenBridgeContracts: TokenBridgeContracts;
  /**
   * Optional: createTokenBridgePrepareSetWethGatewayTransaction's result
   */
  setWethGateway?: {
    /**
     * Transaction of createTokenBridgePrepareSetWethGatewayTransactionReceipt ({@link Transaction})
     */
    transaction: Transaction;
    /**
     * Transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ({@link createTokenBridgePrepareSetWethGatewayTransactionReceipt})
     */
    transactionReceipt: CreateTokenBridgeSetWethGatewayTransactionReceipt<TOrbitChain>;
    /**
     * Retryable transaction receipt of createTokenBridgePrepareSetWethGatewayTransactionReceipt ({@link WaitForRetryablesResult})
     */
    retryables: [TransactionReceipt];
  };
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
 * @param {String} createRollupParams.rollupOwner - The address of the rollup owner
 * @param {Object} createRollupParams.rollupAddress - The address of the Rollup contract
 * @param {Object} [createRollupParams.account] - The private key account to sign transactions
 * @param {String} [createRollupParams.nativeTokenAddress=] - Optional
 * If nativeTokenAddress is passed and different than zero address, deploy a token bridge with custom fee token.
 * @param {Object} createRollupParams.parentChainPublicClient - The parent chain Viem Public Client
 * @param {Object} createRollupParams.orbitChainPublicClient - The orbit chain Viem Public Client
 * @param {String} [createRollupParams.tokenBridgeCreatorAddressOverride=] - Optional
 * If tokenBridgeCreatorAddressOverride is passed, the address is overridden in the different transactions
 * @param {Object} [createRollupParams.gasOverrides=] - {@link TransactionRequestGasOverrides} Optional
 * Gas overrides for createTokenBridgePrepareTransactionRequest
 * @param {Object} createRollupParams.retryableGasOverrides - {@link TokenBridgeRetryableGasOverrides} Optional
 * Retryable gas overrides for createTokenBridgePrepareTransactionRequest
 * @param {Object} createRollupParams.setWethGatewayGasOverrides - {@link SetWethGatewayRetryableGasOverrides} Optional
 * Retryable gas overrides for createTokenBridgePrepareSetWethGatewayTransactionRequest
 *
 * @returns Promise<{@link CreateTokenBridgeResults}>
 *
 * @example
 * const tokenBridgeCreator = await deployTokenBridgeCreator({
 *   publicClient: l2Client,
 * });
 *
 * const tokenBridgeContracts = await createTokenBridge({
 *   rollupOwner: rollupOwner.address,
 *   rollupAddress: rollupAddress,
 *   account: deployer,
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
export async function createTokenBridge<
  TParentChain extends Chain | undefined,
  TOrbitChain extends Chain | undefined,
>({
  rollupOwner,
  rollupAddress,
  account,
  nativeTokenAddress,
  parentChainPublicClient,
  orbitChainPublicClient,
  tokenBridgeCreatorAddressOverride,
  gasOverrides,
  retryableGasOverrides,
  setWethGatewayGasOverrides,
}: CreateTokenBridgeParams<TParentChain, TOrbitChain>): Promise<
  CreateTokenBridgeResults<TParentChain, TOrbitChain>
> {
  const isTokenBridgeAlreadyDeployed = await isTokenBridgeDeployed({
    parentChainPublicClient,
    orbitChainPublicClient,
    tokenBridgeCreatorAddress: tokenBridgeCreatorAddressOverride,
    rollupAddress,
  });

  if (isTokenBridgeAlreadyDeployed) {
    throw new Error(`Token bridge contracts for Rollup ${rollupAddress} are already deployed`);
  }

  const isCustomFeeTokenBridge = isCustomFeeTokenAddress(nativeTokenAddress);
  if (isCustomFeeTokenBridge) {
    // set the custom fee token
    // prepare transaction to approve custom fee token spend
    const allowanceParams: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams<TParentChain> = {
      nativeToken: nativeTokenAddress,
      owner: account.address,
      publicClient: parentChainPublicClient,
      tokenBridgeCreatorAddressOverride,
    };

    // Check allowance and approve if necessary
    if (!(await createTokenBridgeEnoughCustomFeeTokenAllowance(allowanceParams))) {
      const approvalTxRequest =
        await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(allowanceParams);

      // sign and send the transaction
      const approvalTxHash = await parentChainPublicClient.sendRawTransaction({
        serializedTransaction: await account.signTransaction(approvalTxRequest),
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
      rollupOwner,
    },
    parentChainPublicClient,
    orbitChainPublicClient,
    account: account.address,
    tokenBridgeCreatorAddressOverride,
    gasOverrides,
    retryableGasOverrides,
  });

  // sign and send the transaction
  console.log(`Deploying the TokenBridge...`);
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await account.signTransaction(txRequest),
  });

  const transaction = await parentChainPublicClient.getTransaction({ hash: txHash });

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
    // @ts-ignore (todo: fix viem type issue)
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
    // @ts-ignore (todo: fix viem type issue)
    parentChainPublicClient,
  });

  // Non custom fee token
  if (!isCustomFeeTokenBridge) {
    // set weth gateway
    const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
      rollup: rollupAddress,
      parentChainPublicClient,
      orbitChainPublicClient,
      account: account.address,
      tokenBridgeCreatorAddressOverride,
      retryableGasOverrides: setWethGatewayGasOverrides,
    });

    // sign and send the transaction
    const setWethGatewayTxHash = await parentChainPublicClient.sendRawTransaction({
      serializedTransaction: await account.signTransaction(setWethGatewayTxRequest),
    });

    const setWethGatewayTransaction = await parentChainPublicClient.getTransaction({
      hash: setWethGatewayTxHash,
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
        // @ts-ignore (todo: fix viem type issue)
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

    return {
      transaction,
      // @ts-ignore (todo: fix viem type issue)
      transactionReceipt: txReceipt,
      retryables: orbitChainRetryableReceipts,
      tokenBridgeContracts,
      setWethGateway: {
        transaction: setWethGatewayTransaction,
        // @ts-ignore (todo: fix viem type issue)
        transactionReceipt: setWethGatewayTxReceipt,
        retryables: [orbitChainSetWethGatewayRetryableReceipt[0]],
      },
    };
  }

  return {
    transaction,
    // @ts-ignore (todo: fix viem type issue)
    transactionReceipt: txReceipt,
    retryables: orbitChainRetryableReceipts,
    tokenBridgeContracts,
  };
}
