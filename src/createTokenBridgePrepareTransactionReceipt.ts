import { PublicClient, TransactionReceipt } from 'viem';
import { L1ToL2MessageStatus, L1TransactionReceipt } from '@arbitrum/sdk';
import { TransactionReceipt as EthersTransactionReceipt } from '@ethersproject/abstract-provider';

import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { viemTransactionReceiptToEthersTransactionReceipt } from './ethers-compat/viemTransactionReceiptToEthersTransactionReceipt';
import { ethersTransactionReceiptToViemTransactionReceipt } from './ethers-compat/ethersTransactionReceiptToViemTransactionReceipt';

type RedeemedRetryableTicket = {
  status: L1ToL2MessageStatus.REDEEMED;
  l2TxReceipt: EthersTransactionReceipt;
};

export type WaitForRetryablesParameters = {
  orbitPublicClient: PublicClient;
};

export type WaitForRetryablesResult = [TransactionReceipt, TransactionReceipt];

export type CreateTokenBridgeTransactionReceipt = TransactionReceipt & {
  waitForRetryables(params: WaitForRetryablesParameters): Promise<void>;
};

export function createTokenBridgePrepareTransactionReceipt(txReceipt: TransactionReceipt) {
  return {
    ...txReceipt,
    waitForRetryables: async function ({
      orbitPublicClient,
    }: WaitForRetryablesParameters): Promise<WaitForRetryablesResult> {
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
  };
}
