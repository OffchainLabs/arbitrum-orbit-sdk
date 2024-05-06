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
}).extend(
  rollupAdminLogicPublicActions({
    rollup: l3Rollup,
  }),
);

it('successfully set validators', async () => {
  const randomAccounts = [
    privateKeyToAccount(generatePrivateKey()).address,
    privateKeyToAccount(generatePrivateKey()).address,
  ];

  const tx = await client.rollupAdminLogicPrepareTransactionRequest({
    functionName: 'setValidator',
    args: [randomAccounts, [true, false]],
    account: l3RollupOwner.address,
    upgradeExecutor: l3UpgradeExecutor,
    rollup: l3Rollup,
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
      rollup: l3Rollup,
    }),
    client.rollupAdminLogicReadContract({
      functionName: 'isValidator',
      args: [randomAccounts[1]],
      rollup: l3Rollup,
    }),
  ]);

  expect(validators).toEqual([true, false]);
});

it('successfully enable/disable whitelist', async () => {
  const whitelistDisabledBefore = await client.rollupAdminLogicReadContract({
    functionName: 'validatorWhitelistDisabled',
  });

  // By default whitelist is not disabled
  expect(whitelistDisabledBefore).toEqual(false);

  const tx = await client.rollupAdminLogicPrepareTransactionRequest({
    functionName: 'setValidatorWhitelistDisabled',
    args: [true],
    account: l3RollupOwner.address,
    rollup: l3Rollup,
    upgradeExecutor: l3UpgradeExecutor,
  });

  await client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(
      tx as PrepareTransactionRequestReturnType & { chainId: number },
    ),
  });

  const whitelistDisabled = await client.rollupAdminLogicReadContract({
    functionName: 'validatorWhitelistDisabled',
    rollup: l3Rollup,
  });

  expect(whitelistDisabled).toEqual(true);

  // Revert changes, so test can be run multiple time without issues
  const revertTx = await client.rollupAdminLogicPrepareTransactionRequest({
    functionName: 'setValidatorWhitelistDisabled',
    args: [false],
    account: l3RollupOwner.address,
    rollup: l3Rollup,
    upgradeExecutor: l3UpgradeExecutor,
  });

  await client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(
      revertTx as PrepareTransactionRequestReturnType & { chainId: number },
    ),
  });
});
