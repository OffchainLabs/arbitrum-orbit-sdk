import { it, expect } from 'vitest';
import { Address, createPublicClient, http, encodeFunctionData } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL3 } from './chains';
import { arbOwner } from './contracts';
import { getNitroTestnodePrivateKeyAccounts } from './testHelpers';
import { withUpgradeExecutor } from './withUpgradeExecutor';

// L3 Owner Private Key
const devPrivateKey = getNitroTestnodePrivateKeyAccounts().l3RollupOwner.privateKey;

// L3 Upgrade Executor Address
let upgradeExecutor: Address = '0x24198F8A339cd3C47AEa3A764A20d2dDaB4D1b5b';

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

// Client for arb owner public actions
const client = createPublicClient({
  chain: nitroTestnodeL3,
  transport: http(),
});

const chainId = nitroTestnodeL3.id;

it('successfully updates infra fee receiver', async () => {
  const initialInfraFeeReceiver = await client.readContract({
    abi: arbOwner.abi,
    address: arbOwner.address,
    functionName: 'getInfraFeeAccount',
  });

  // assert account is not already infra fee receiver
  expect(initialInfraFeeReceiver).not.toEqual(randomAccount.address);

  const transactionRequest = await client.prepareTransactionRequest(
    withUpgradeExecutor(
      {
        to: arbOwner.address,
        data: encodeFunctionData({
          abi: arbOwner.abi,
          functionName: 'setInfraFeeAccount',
          args: [randomAccount.address],
        }),
        chainId: client.chain.id,
        account: owner.address,
      },
      { upgradeExecutor },
    ),
  );

  // submit tx to update infra fee receiver
  await client.sendRawTransaction({
    serializedTransaction: await owner.signTransaction({ ...transactionRequest, chainId }),
  });

  const infraFeeReceiver = await client.readContract({
    abi: arbOwner.abi,
    address: arbOwner.address,
    functionName: 'getInfraFeeAccount',
  });

  // assert account is now infra fee receiver
  expect(infraFeeReceiver).toEqual(randomAccount.address);
});
