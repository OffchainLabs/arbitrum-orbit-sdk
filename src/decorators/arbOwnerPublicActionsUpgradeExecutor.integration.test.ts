import { it, expect } from 'vitest';
import { Address, createPublicClient, http, zeroAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { orbitLocal} from '../testHelpers';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';

// L3 Owner Private Key
const devPrivateKey =
  '0xecdf21cb41c65afb51f91df408b7656e2c8739a5877f2814add0afd780cc210e';

// L3 Upgrade Executor Address
let upgradeExecutorAddress:Address = '0x24198F8A339cd3C47AEa3A764A20d2dDaB4D1b5b'

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

const client = createPublicClient({
  chain: orbitLocal,
  transport: http(),
}).extend(arbOwnerPublicActions);

it('succesfully adds chain owner using upgrade executor', async () => {
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

it('successfully updates infra fee receiver', async () => {
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

