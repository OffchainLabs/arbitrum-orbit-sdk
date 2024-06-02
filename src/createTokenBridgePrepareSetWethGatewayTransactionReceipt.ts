import { PublicClient, TransactionReceipt } from 'viem';
import { L1ToL2MessageStatus, L1TransactionReceipt } from '@arbitrum/sdk';
import { TransactionReceipt as EthersTransactionReceipt } from '@ethersproject/abstract-provider';

import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { viemTransactionReceiptToEthersTransactionReceipt } from './ethers-compat/viemTransactionReceiptToEthersTransactionReceipt';
import { ethersTransactionReceiptToViemTransactionReceipt } from './ethers-compat/ethersTransactionReceiptToViemTransactionReceipt';

/**
 * Represents a redeemed retryable ticket.
 *
 * @typedef {Object} RedeemedRetryableTicket
 * @property {L1ToL2MessageStatus.REDEEMED} status - The status of the message, indicating it has been redeemed.
 * @property {EthersTransactionReceipt} l2TxReceipt - The transaction receipt on the L2 chain.
 */
type RedeemedRetryableTicket = {
  status: L1ToL2MessageStatus.REDEEMED;
  l2TxReceipt: EthersTransactionReceipt;
};

/**
 * Parameters required to wait for retryable messages.
 *
 * @typedef {Object} WaitForRetryablesParameters
 * @property {PublicClient} orbitPublicClient - The public client for the Orbit chain.
 */
export type WaitForRetryablesParameters = {
  orbitPublicClient: PublicClient;
};

/**
 * Result of waiting for retryable messages.
 *
 * @typedef {Array<TransactionReceipt>} WaitForRetryablesResult - An array containing a single transaction receipt.
 */
export type WaitForRetryablesResult = [TransactionReceipt];

/**
 * Extended transaction receipt with added functionality to wait for retryable messages.
 *
 * @typedef {Object} CreateTokenBridgeSetWethGatewayTransactionReceipt
 * @property {function(WaitForRetryablesParameters): Promise<WaitForRetryablesResult>} waitForRetryables - Method to wait for retryable messages.
 */
export type CreateTokenBridgeSetWethGatewayTransactionReceipt = TransactionReceipt & {
  /**
   * Waits for retryable messages on the Orbit chain.
   *
   * @param {WaitForRetryablesParameters} params - The parameters required to wait for retryables.
   * @param {PublicClient} params.orbitPublicClient - The public client for the Orbit chain.
   * @returns {Promise<WaitForRetryablesResult>} - A promise that resolves to an array of transaction receipts.
   */
  waitForRetryables(params: WaitForRetryablesParameters): Promise<WaitForRetryablesResult>;
};

/**
 * Creates a token bridge transaction receipt for setting up the WETH gateway,
 * including a method to wait for retryable messages on the Orbit chain.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt to extend.
 * @returns {CreateTokenBridgeSetWethGatewayTransactionReceipt} - The extended transaction receipt with added functionality.
 */
export function createTokenBridgePrepareSetWethGatewayTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateTokenBridgeSetWethGatewayTransactionReceipt {
  return {
    ...txReceipt,
    waitForRetryables: async function ({
      orbitPublicClient,
    }: WaitForRetryablesParameters): Promise<WaitForRetryablesResult> {
      const ethersTxReceipt = viemTransactionReceiptToEthersTransactionReceipt(txReceipt);
      const parentChainTxReceipt = new L1TransactionReceipt(ethersTxReceipt);
      const orbitProvider = publicClientToProvider(orbitPublicClient);
      const messages = await parentChainTxReceipt.getL1ToL2Messages(orbitProvider);
      const messagesResults = await Promise.all(messages.map((message) => message.waitForStatus()));

      if (messagesResults.length !== 1) {
        throw Error(`Unexpected number of retryable tickets: ${messagesResults.length}`);
      }

      if (messagesResults[0].status !== L1ToL2MessageStatus.REDEEMED) {
        throw Error(`Unexpected status for retryable ticket: ${messages[0].retryableCreationId}`);
      }

      return (
        // these type casts are both fine as we already checked everything above
        (messagesResults as unknown as [RedeemedRetryableTicket])
          //
          .map((result) =>
            ethersTransactionReceiptToViemTransactionReceipt(result.l2TxReceipt),
          ) as WaitForRetryablesResult
      );
    },
  };
}
