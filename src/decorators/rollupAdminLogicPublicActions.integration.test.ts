import { it, expect } from 'vitest';
import { PrepareTransactionRequestReturnType, createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL2 } from '../chains';
import { rollupAdminLogicPublicActions } from './rollupAdminLogicPublicActions';
import { getNitroTestnodePrivateKeyAccounts } from '../testHelpers';

// l2 owner private key
const devPrivateKey = getNitroTestnodePrivateKeyAccounts().l2RollupOwner.privateKey;

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

const rollupAddress = '0x';

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(rollupAdminLogicPublicActions);

it('successfully sets delayed inbox', async () => {
  const transactionRequest = await client.rollupAdminLogicPrepareTransactionRequest({
    functionName: 'setDelayedInbox',
    args: ['0x', true],
    rollupAdminLogicAddress: rollupAddress,
    account: owner.address,
  });

  // submit tx to set delayed inbox
  await client.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(
      transactionRequest as PrepareTransactionRequestReturnType & { chainId: number },
    ),
  });
});
