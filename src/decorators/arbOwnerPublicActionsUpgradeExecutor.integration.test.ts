import { it, expect } from 'vitest';
import { Address, createPublicClient, http, zeroAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { arbitrumLocal } from '../testHelpers';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';

// L2 Owner Private Key
const devPrivateKey =
  '0xdc04c5399f82306ec4b4d654a342f40e2e0620fe39950d967e1e574b32d4dd36';

// L3 Upgrade Executor Address
let upgradeExecutorAddress:Address = '0xc9875f9588b765A81c212E211B8bB00Fe6af2ac9'

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

const client = createPublicClient({
  chain: arbitrumLocal,
  transport: http(),
}).extend(arbOwnerPublicActions);

it('succesfully adds chain owner using upgrade executor', async () => {
  // adding l3 upgrade executor as l3 chain owner
  const transactionRequest1 = await client.arbOwnerPrepareTransactionRequest({
    functionName: 'addChainOwner',
    args: [upgradeExecutorAddress],
    upgradeExecutor: false,
    account: owner.address,
  });

  // submit tx to add upgrade executor as chain owner
  await client.sendRawTransaction({
    // @ts-ignore
    serializedTransaction: await owner.signTransaction(transactionRequest1),
  });

  // Checks if upgrade executor is added successfully
  const isOwnerUpgradeExecutor = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [upgradeExecutorAddress],
  });

  expect(isOwnerUpgradeExecutor).toEqual(true);

  // Checks if random address is not a chain owner yet
  const isOwnerInitially = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });

  expect(isOwnerInitially).toEqual(false);

  // Adding random address as chain owner using upgrade executor
  const transactionRequest2 = await client.arbOwnerPrepareTransactionRequest({
    functionName: 'addChainOwner',
    args: [randomAccount.address],
    upgradeExecutor: upgradeExecutorAddress,
    account: owner.address,
  });

  // submit tx to add chain owner
  await client.sendRawTransaction({
    // @ts-ignore
    serializedTransaction: await owner.signTransaction(transactionRequest2),
  });
  const isOwner = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });

  // assert account is now owner
  expect(isOwner).toEqual(true);
});

it('succesfully removes chain owner', async () => {
  const isOwnerInitially = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });

  // assert account is an owner 
  expect(isOwnerInitially).toEqual(true);

  const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
    functionName: 'removeChainOwner',
    args: [randomAccount.address],
    upgradeExecutor: upgradeExecutorAddress,
    account: owner.address,
  });

  // submit tx to remove chain owner
  await client.sendRawTransaction({
    // @ts-ignore
    serializedTransaction: await owner.signTransaction(transactionRequest),
  });

  const isOwner = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });

  // assert account is no longer chain owner
  expect(isOwner).toEqual(false);
});

it('succesfully updates infra fee receiver', async () => {
  const initialInfraFeeReceiver = await client.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  // assert account is not already infra fee receiver
  expect(initialInfraFeeReceiver).not.toEqual(randomAccount.address);

  const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
    functionName: 'setInfraFeeAccount',
    args: [randomAccount.address],
    upgradeExecutor: upgradeExecutorAddress,
    account: owner.address,
  });

  // submit tx to update infra fee receiver
  await client.sendRawTransaction({
    // @ts-ignore
    serializedTransaction: await owner.signTransaction(transactionRequest),
  });

  const infraFeeReceiver = await client.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  // assert account is now infra fee receiver
  expect(infraFeeReceiver).toEqual(randomAccount.address);
});
