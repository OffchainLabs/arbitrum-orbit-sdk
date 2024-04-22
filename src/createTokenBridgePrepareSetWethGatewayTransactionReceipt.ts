import { PublicClient, TransactionReceipt } from 'viem';
import { ParentToChildMessageStatus, ParentTransactionReceipt } from '@arbitrum/sdk';
import { ParentToChildMessageWaitResult } from '@arbitrum/sdk/dist/lib/message/ParentToChildMessage';

import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { viemTransactionReceiptToEthersTransactionReceipt } from './ethers-compat/viemTransactionReceiptToEthersTransactionReceipt';
import { ethersTransactionReceiptToViemTransactionReceipt } from './ethers-compat/ethersTransactionReceiptToViemTransactionReceipt';

type RedeemedRetryableTicket = Extract<
  ParentToChildMessageWaitResult,
  { status: ParentToChildMessageStatus.REDEEMED }
>;

export type WaitForRetryablesParameters = {
  orbitPublicClient: PublicClient;
};

export type WaitForRetryablesResult = [TransactionReceipt];

export type CreateTokenBridgeSetWethGatewayTransactionReceipt = TransactionReceipt & {
  waitForRetryables(params: WaitForRetryablesParameters): Promise<WaitForRetryablesResult>;
};

export function createTokenBridgePrepareSetWethGatewayTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateTokenBridgeSetWethGatewayTransactionReceipt {
  return {
    ...txReceipt,
    waitForRetryables: async function ({
      orbitPublicClient,
    }: WaitForRetryablesParameters): Promise<WaitForRetryablesResult> {
      const ethersTxReceipt = viemTransactionReceiptToEthersTransactionReceipt(txReceipt);
      const parentChainTxReceipt = new ParentTransactionReceipt(ethersTxReceipt);
      const orbitProvider = publicClientToProvider(orbitPublicClient);
      const messages = await parentChainTxReceipt.getParentToChildMessages(orbitProvider);
      const messagesResults = await Promise.all(messages.map((message) => message.waitForStatus()));

      if (messagesResults.length !== 1) {
        throw Error(`Unexpected number of retryable tickets: ${messagesResults.length}`);
      }

      if (messagesResults[0].status !== ParentToChildMessageStatus.REDEEMED) {
        throw Error(`Unexpected status for retryable ticket: ${messages[0].retryableCreationId}`);
      }

      return (
        // these type casts are both fine as we already checked everything above
        (messagesResults as unknown as [RedeemedRetryableTicket])
          //
          .map((result) =>
            ethersTransactionReceiptToViemTransactionReceipt(result.chainTxReceipt),
          ) as WaitForRetryablesResult
      );
    },
  };
}
