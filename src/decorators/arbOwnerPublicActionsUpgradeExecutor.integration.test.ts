import { it, expect } from 'vitest';
import { Address, createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { nitroTestnodeL3 } from '../chains';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';
import { arbGasInfoPublicActions } from './arbGasInfoPublicActions';
import { getNitroTestnodePrivateKeyAccounts } from '../testHelpers';

// L3 Owner Private Key
const devPrivateKey = getNitroTestnodePrivateKeyAccounts().l3RollupOwner.privateKey;

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

// Client for arb owner public actions
const client = createPublicClient({
  chain: nitroTestnodeL3,
  transport: http(),
})
  .extend(arbOwnerPublicActions)
  .extend(arbGasInfoPublicActions);

async function sendTransaction(
  functionName:
    | 'addChainOwner'
    | 'removeChainOwner'
    | 'setInfraFeeAccount'
    | 'setL1BaseFeeEstimateInertia',
  args: bigint | Address,
) {
  const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
    functionName,
    args: [args],
    upgradeExecutor: false,
    account: owner.address,
  });

  // submit tx to remove chain owner
  const txHash = await client.sendRawTransaction({
    serializedTransaction: await owner.signTransaction(transactionRequest),
  });
  await client.waitForTransactionReceipt({ hash: txHash });
}

it('succesfully adds chain owner using upgrade executor', async () => {
  // Checks if random address is not a chain owner yet
  const isOwnerInitially = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });
  expect(isOwnerInitially).toEqual(false);

  // Adding random address as chain owner using upgrade executor
  await sendTransaction('addChainOwner', randomAccount.address);
  const isOwner = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });
  // assert account is now owner
  expect(isOwner).toEqual(true);

  // Revert the state
  await sendTransaction('removeChainOwner', randomAccount.address);
});

it('successfully updates infra fee receiver', async () => {
  const initialInfraFeeReceiver = await client.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  // assert account is not already infra fee receiver
  expect(initialInfraFeeReceiver).not.toEqual(randomAccount.address);

  await sendTransaction('setInfraFeeAccount', randomAccount.address);

  const infraFeeReceiver = await client.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  // assert account is now infra fee receiver
  expect(infraFeeReceiver).toEqual(randomAccount.address);

  // Reset state
  await sendTransaction('setInfraFeeAccount', initialInfraFeeReceiver);
});

it('successfully updates L1 Base Fee Estimate Inertia on Orbit chain', async () => {
  const initialL1BaseFeeEstimateInertia = await client.arbGasInfoReadContract({
    functionName: 'getL1BaseFeeEstimateInertia',
  });
  const l1BaseFeeEstimateInertia = BigInt(9);
  await sendTransaction('setL1BaseFeeEstimateInertia', l1BaseFeeEstimateInertia);

  const newL1BaseFeeEstimateInertia = await client.arbGasInfoReadContract({
    functionName: 'getL1BaseFeeEstimateInertia',
  });

  expect(newL1BaseFeeEstimateInertia).toEqual(l1BaseFeeEstimateInertia);

  // Revert the state
  await sendTransaction('setL1BaseFeeEstimateInertia', initialL1BaseFeeEstimateInertia);
});
