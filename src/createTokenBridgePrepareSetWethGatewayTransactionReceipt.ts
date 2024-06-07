import { PublicClient, TransactionReceipt } from 'viem';
import { L1ToL2MessageStatus, L1TransactionReceipt } from '@arbitrum/sdk';
import { TransactionReceipt as EthersTransactionReceipt } from '@ethersproject/abstract-provider';

import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { viemTransactionReceiptToEthersTransactionReceipt } from './ethers-compat/viemTransactionReceiptToEthersTransactionReceipt';
import { ethersTransactionReceiptToViemTransactionReceipt } from './ethers-compat/ethersTransactionReceiptToViemTransactionReceipt';

/**
 * Represents a redeemed retryable ticket.
 * @typedef {Object} RedeemedRetryableTicket
 * @property {L1ToL2MessageStatus.REDEEMED} status - The status of the retryable ticket.
 * @property {EthersTransactionReceipt} l2TxReceipt - The L2 transaction receipt.
 */
type RedeemedRetryableTicket = {
  status: L1ToL2MessageStatus.REDEEMED;
  l2TxReceipt: EthersTransactionReceipt;
};

/**
 * Parameters for waiting for retryable tickets.
 * @typedef {Object} WaitForRetryablesParameters
 * @property {PublicClient} orbitPublicClient - The public client for the Orbit chain.
 */
export type WaitForRetryablesParameters = {
  orbitPublicClient: PublicClient;
};

/**
 * Result of waiting for retryable tickets.
 * @typedef {Array<TransactionReceipt>} WaitForRetryablesResult
 */
export type WaitForRetryablesResult = [TransactionReceipt];

/**
 * Extended transaction receipt with a method to wait for retryable tickets.
 * @typedef {Object} CreateTokenBridgeSetWethGatewayTransactionReceipt
 * @property {function(WaitForRetryablesParameters): Promise<WaitForRetryablesResult>} waitForRetryables - Method to wait for retryable tickets.
 */
export type CreateTokenBridgeSetWethGatewayTransactionReceipt = TransactionReceipt & {
  waitForRetryables(params: WaitForRetryablesParameters): Promise<WaitForRetryablesResult>;
};

/**
 * Creates an extended transaction receipt with a method to wait for retryable tickets.
 *
 * @param {TransactionReceipt} txReceipt - The original transaction receipt.
 * @returns {CreateTokenBridgeSetWethGatewayTransactionReceipt} The extended transaction receipt.
 */
export function createTokenBridgePrepareSetWethGatewayTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateTokenBridgeSetWethGatewayTransactionReceipt {
  return {
    ...txReceipt,
    /**
     * Waits for the retryable tickets to be redeemed.
     *
     * @param {WaitForRetryablesParameters} params - Parameters for waiting for retryable tickets.
     * @param {PublicClient} params.orbitPublicClient - The public client for the Orbit chain.
     * @returns {Promise<WaitForRetryablesResult>} A promise that resolves to the result of waiting for retryable tickets.
     * @throws Will throw an error if the number of retryable tickets is unexpected or if the status is not REDEEMED.
     */
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
