import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { arbitrumLocal } from '../testHelpers';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';

const devPrivateKey =
  '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659';

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

const client = createPublicClient({
  chain: arbitrumLocal,
  transport: http(),
}).extend(arbOwnerPublicActions);

it('succesfully adds chain owner', async () => {
  const isOwnerInitially = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });

  // assert account is not already an owner
  expect(isOwnerInitially).toEqual(false);

  const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
    functionName: 'addChainOwner',
    args: [randomAccount.address],
    upgradeExecutor: false,
    account: owner.address,
  });

  // submit tx to add chain owner
  await client.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
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
    upgradeExecutor: false,
    account: owner.address,
  });

  // submit tx to remove chain owner
  await client.sendRawTransaction({
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
    upgradeExecutor: false,
    account: owner.address,
  });

  // submit tx to update infra fee receiver
  await client.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
  });

  const infraFeeReceiver = await client.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  // assert account is now infra fee receiver
  expect(infraFeeReceiver).toEqual(randomAccount.address);
});
