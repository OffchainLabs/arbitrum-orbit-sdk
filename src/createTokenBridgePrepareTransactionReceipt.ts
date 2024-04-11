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

function decodeOrbitTokenBridgeCreatedEventLog(log: Log<bigint, number>) {
  const decodedEventLog = decodeEventLog({ ...log, abi: tokenBridgeCreator.abi });

  if (decodedEventLog.eventName !== 'OrbitTokenBridgeCreated') {
    throw new Error(
      `Expected "OrbitTokenBridgeCreated" event but found: ${decodedEventLog.eventName}`,
    );
  }

  return decodedEventLog;
}

type RedeemedRetryableTicket = {
  status: L1ToL2MessageStatus.REDEEMED;
  l2TxReceipt: EthersTransactionReceipt;
};

export type WaitForRetryablesParameters = {
  orbitPublicClient: PublicClient;
};

export type WaitForRetryablesResult = [TransactionReceipt, TransactionReceipt];

type GetTokenBridgeContractsParameters = {
  parentChainPublicClient: PublicClient;
};

export type CreateTokenBridgeTransactionReceipt = TransactionReceipt & {
  waitForRetryables(params: WaitForRetryablesParameters): Promise<WaitForRetryablesResult>;
  getTokenBridgeContracts(
    parentChainPublicClient: GetTokenBridgeContractsParameters,
  ): Promise<TokenBridgeContracts>;
};

export function createTokenBridgePrepareTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateTokenBridgeTransactionReceipt {
  return {
    ...txReceipt,
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
