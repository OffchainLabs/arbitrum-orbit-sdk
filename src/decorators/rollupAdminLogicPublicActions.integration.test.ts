import { it, expect } from 'vitest';
import { PrepareTransactionRequestReturnType, createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL2 } from '../chains';
import { rollupAdminLogicPublicActions } from './rollupAdminLogicPublicActions';
import { getInformationFromTestnode, getNitroTestnodePrivateKeyAccounts } from '../testHelpers';

const { l3RollupOwner } = getNitroTestnodePrivateKeyAccounts();
const { l3Rollup, l3UpgradeExecutor } = getInformationFromTestnode();

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(rollupAdminLogicPublicActions);

it('successfully set validators', async () => {
  const randomAccounts = [
    privateKeyToAccount(generatePrivateKey()).address,
    privateKeyToAccount(generatePrivateKey()).address,
  ];

  const tx = await client.rollupAdminLogicPrepareTransactionRequest({
    functionName: 'setValidator',
    args: [randomAccounts, [true, false]],
    account: l3RollupOwner.address,
    rollupAdminLogicAddress: l3Rollup,
    upgradeExecutor: l3UpgradeExecutor,
  });

  await client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(
      tx as PrepareTransactionRequestReturnType & { chainId: number },
    ),
  });

  const validators = await Promise.all([
    client.rollupAdminLogicReadContract({
      functionName: 'isValidator',
      args: [randomAccounts[0]],
      rollupAddress: l3Rollup,
    }),
    client.rollupAdminLogicReadContract({
      functionName: 'isValidator',
      args: [randomAccounts[1]],
      rollupAddress: l3Rollup,
    }),
  ]);

  expect(validators).toEqual([true, false]);
});
