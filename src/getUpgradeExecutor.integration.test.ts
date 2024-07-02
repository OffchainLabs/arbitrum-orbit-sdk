import { describe, it, expect } from 'vitest';
import { Address, PrivateKeyAccount, createPublicClient, http } from 'viem';

import { nitroTestnodeL2 } from './chains';
import { getInformationFromTestnode, getNitroTestnodePrivateKeyAccounts } from './testHelpers';
import { getUpgradeExecutor } from './getUpgradeExecutor';
import { rollupAdminLogicPrepareFunctionData } from './rollupAdminLogicPrepareTransactionRequest';
import { rollupAdminLogicABI } from './abi';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const { l3UpgradeExecutor, l3Rollup } = getInformationFromTestnode();
const { l3RollupOwner } = getNitroTestnodePrivateKeyAccounts();

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

async function setUpgradeExecutor({
  account,
  newOwner,
  upgradeExecutor,
}: {
  account: PrivateKeyAccount;
  newOwner: Address;
  upgradeExecutor: Address;
}) {
  const { to, data, value } = rollupAdminLogicPrepareFunctionData({
    args: [newOwner],
    rollup: l3Rollup,
    upgradeExecutor,
    abi: rollupAdminLogicABI,
    functionName: 'setOwner',
  });

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account,
  });

  const txHash = await client.sendRawTransaction({
    serializedTransaction: await account.signTransaction({
      ...request,
      chainId: nitroTestnodeL2.id,
    }),
  });
  await client.waitForTransactionReceipt({
    hash: txHash,
  });
}

// Tests can be enabled once we run one node per integration test
describe('successfully get upgrade executor', () => {
  it('when changing upgrade executor multiple time', async () => {
    const randomAccount = privateKeyToAccount(generatePrivateKey()).address;

    const initialUpgradeExecutor = await getUpgradeExecutor(client, {
      rollup: l3Rollup,
    });
    expect(initialUpgradeExecutor?.toLowerCase()).toEqual(l3UpgradeExecutor.toLowerCase());

    await setUpgradeExecutor({
      upgradeExecutor: l3UpgradeExecutor,
      account: l3RollupOwner,
      newOwner: randomAccount,
    });

    const currentUpgradeExecutor = await getUpgradeExecutor(client, {
      rollup: l3Rollup,
    });
    expect(currentUpgradeExecutor?.toLowerCase()).toEqual(randomAccount.toLowerCase());

    // Revert for future tests
    await setUpgradeExecutor({
      upgradeExecutor: l3UpgradeExecutor,
      account: l3RollupOwner,
      newOwner: l3UpgradeExecutor,
    });

    const finalUpgradeExecutor = await getUpgradeExecutor(client, {
      rollup: l3Rollup,
    });
    expect(finalUpgradeExecutor?.toLowerCase()).toEqual(l3UpgradeExecutor.toLowerCase());
  });
});
