import {
  Log,
  PublicClient,
  TransactionReceipt,
  decodeEventLog,
  getAbiItem,
  getEventSelector,
} from 'viem';
import { L1ToL2MessageStatus, L1TransactionReceipt } from '@arbitrum/sdk';
import { TransactionReceipt as EthersTransactionReceipt } from '@ethersproject/abstract-provider';

import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { viemTransactionReceiptToEthersTransactionReceipt } from './ethers-compat/viemTransactionReceiptToEthersTransactionReceipt';
import { ethersTransactionReceiptToViemTransactionReceipt } from './ethers-compat/ethersTransactionReceiptToViemTransactionReceipt';
import { TokenBridgeContracts } from './types/TokenBridgeContracts';
import { tokenBridgeCreator } from './contracts';
import { createTokenBridgeFetchTokenBridgeContracts } from './createTokenBridgeFetchTokenBridgeContracts';

/**
 * Finds the OrbitTokenBridgeCreated event log in the transaction receipt.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt
 * @returns {Log} - The log of the OrbitTokenBridgeCreated event
 * @throws {Error} - If no OrbitTokenBridgeCreated log is found
 */
function findOrbitTokenBridgeCreatedEventLog(txReceipt: TransactionReceipt) {
  const abiItem = getAbiItem({ abi: tokenBridgeCreator.abi, name: 'OrbitTokenBridgeCreated' });
  const eventSelector = getEventSelector(abiItem);
  const log = txReceipt.logs.find((log) => log.topics[0] === eventSelector);

  if (typeof log === 'undefined') {
    throw new Error(
      `No "OrbitTokenBridgeCreated" logs found in logs for transaction: ${txReceipt.transactionHash}`,
    );
  }

  return log;
}

/**
 * Decodes the OrbitTokenBridgeCreated event log.
 *
 * @param {Log<bigint, number>} log - The log to decode
 * @returns {Object} - The decoded event log
 * @throws {Error} - If the event name is not OrbitTokenBridgeCreated
 */
function decodeOrbitTokenBridgeCreatedEventLog(log: Log<bigint, number>) {
  const decodedEventLog = decodeEventLog({ ...log, abi: tokenBridgeCreator.abi });

  if (decodedEventLog.eventName !== 'OrbitTokenBridgeCreated') {
    throw new Error(
      `Expected "OrbitTokenBridgeCreated" event but found: ${decodedEventLog.eventName}`,
    );
  }

  return decodedEventLog;
}

/**
 * Represents a redeemed retryable ticket.
 *
 * @typedef {Object} RedeemedRetryableTicket
 * @property {L1ToL2MessageStatus.REDEEMED} status - The status of the redeemed retryable ticket
 * @property {EthersTransactionReceipt} l2TxReceipt - The L2 transaction receipt
 */
type RedeemedRetryableTicket = {
  status: L1ToL2MessageStatus.REDEEMED;
  l2TxReceipt: EthersTransactionReceipt;
};

/**
 * Parameters for waiting for retryables.
 *
 * @typedef {Object} WaitForRetryablesParameters
 * @property {PublicClient} orbitPublicClient - The public client for the Orbit chain
 */
export type WaitForRetryablesParameters = {
  orbitPublicClient: PublicClient;
};

/**
 * Result of waiting for retryables.
 *
 * @typedef {Array<TransactionReceipt>} WaitForRetryablesResult
 */
export type WaitForRetryablesResult = [TransactionReceipt, TransactionReceipt];

/**
 * Parameters for getting token bridge contracts.
 *
 * @typedef {Object} GetTokenBridgeContractsParameters
 * @property {PublicClient} parentChainPublicClient - The public client for the parent chain
 */
type GetTokenBridgeContractsParameters = {
  parentChainPublicClient: PublicClient;
};

/**
 * Represents a transaction receipt with methods to wait for retryables and get token bridge contracts.
 *
 * @typedef {Object} CreateTokenBridgeTransactionReceipt
 * @property {function(WaitForRetryablesParameters): Promise<WaitForRetryablesResult>} waitForRetryables - Waits for retryables
 * @property {function(GetTokenBridgeContractsParameters): Promise<TokenBridgeContracts>} getTokenBridgeContracts - Gets the token bridge contracts
 */
export type CreateTokenBridgeTransactionReceipt = TransactionReceipt & {
  waitForRetryables(params: WaitForRetryablesParameters): Promise<WaitForRetryablesResult>;
  getTokenBridgeContracts(
    parentChainPublicClient: GetTokenBridgeContractsParameters,
  ): Promise<TokenBridgeContracts>;
};

/**
 * Creates a transaction receipt with methods to wait for retryables and get
 * token bridge contracts.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt
 * @returns {CreateTokenBridgeTransactionReceipt} - The created transaction receipt
 */
export function createTokenBridgePrepareTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateTokenBridgeTransactionReceipt {
  return {
    ...txReceipt,
    /**
     * Waits for retryables to be redeemed.
     *
     * @param {WaitForRetryablesParameters} params - Parameters for waiting for retryables
     * @param {PublicClient} params.orbitPublicClient - The public client for the Orbit chain
     * @returns {Promise<WaitForRetryablesResult>} - The result of waiting for retryables
     * @throws {Error} - If an unexpected number of retryable tickets or unexpected status is found
     */
    waitForRetryables: async function ({ orbitPublicClient }) {
      const ethersTxReceipt = viemTransactionReceiptToEthersTransactionReceipt(txReceipt);
      const l1TxReceipt = new L1TransactionReceipt(ethersTxReceipt);
      const orbitProvider = publicClientToProvider(orbitPublicClient);
      const messages = await l1TxReceipt.getL1ToL2Messages(orbitProvider);
      const messagesResults = await Promise.all(messages.map((message) => message.waitForStatus()));

      if (messagesResults.length !== 2) {
        throw Error(`Unexpected number of retryable tickets: ${messagesResults.length}`);
      }

      if (messagesResults[0].status !== L1ToL2MessageStatus.REDEEMED) {
        throw Error(`Unexpected status for retryable ticket: ${messages[0].retryableCreationId}`);
      }

      if (messagesResults[1].status !== L1ToL2MessageStatus.REDEEMED) {
        throw Error(`Unexpected status for retryable ticket: ${messages[1].retryableCreationId}`);
      }

      return (
        // these type casts are both fine as we already checked everything above
        (messagesResults as unknown as [RedeemedRetryableTicket, RedeemedRetryableTicket])
          //
          .map((result) =>
            ethersTransactionReceiptToViemTransactionReceipt(result.l2TxReceipt),
          ) as WaitForRetryablesResult
      );
    },
    /**
     * Gets the token bridge contracts.
     *
     * @param {GetTokenBridgeContractsParameters} params - Parameters for getting token bridge contracts
     * @param {PublicClient} params.parentChainPublicClient - The public client for the parent chain
     * @returns {Promise<TokenBridgeContracts>} - The token bridge contracts
     */
    getTokenBridgeContracts: async function ({ parentChainPublicClient }) {
      const eventLog = findOrbitTokenBridgeCreatedEventLog(txReceipt);
      const decodedEventLog = decodeOrbitTokenBridgeCreatedEventLog(eventLog);
      const { inbox } = decodedEventLog.args;

      return createTokenBridgeFetchTokenBridgeContracts({
        inbox,
        parentChainPublicClient,
      });
    },
  };
}
