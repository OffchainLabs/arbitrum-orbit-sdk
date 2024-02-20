import { it, expect } from 'vitest';
import { createPublicClient, http, zeroAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { arbitrumLocal } from '../testHelpers';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';

import { createTokenBridgePrepareTransactionRequest } from '../createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from '../createTokenBridgePrepareTransactionReceipt';
import { deployTokenBridgeCreator } from '../createTokenBridge-testHelpers';
import { execSync } from 'node:child_process';
import { getNitroTestnodePrivateKeyAccounts } from '../testHelpers';
import { nitroTestnodeL1, nitroTestnodeL2 } from '../chains';
import { upgradeExecutor } from '../contracts';


const devPrivateKey =
  '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659';

const owner = privateKeyToAccount(devPrivateKey);
const randomAccount = privateKeyToAccount(generatePrivateKey());

const client = createPublicClient({
  chain: arbitrumLocal,
  transport: http(),
}).extend(arbOwnerPublicActions);

type TestnodeInformation = {
  rollup: `0x${string}`;
  l3Rollup: `0x${string}`;
  l3NativeToken: `0x${string}`;
};

function getInformationFromTestnode(): TestnodeInformation {
  const containers = [
    'nitro_sequencer_1',
    'nitro-sequencer-1',
    'nitro-testnode-sequencer-1',
    'nitro-testnode_sequencer_1',
  ];

  for (const container of containers) {
    try {
      const deploymentJson = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/deployment.json').toString(),
      );

      const l3DeploymentJson = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/l3deployment.json').toString(),
      );

      return {
        rollup: deploymentJson['rollup'],
        l3Rollup: l3DeploymentJson['rollup'],
        l3NativeToken: l3DeploymentJson['native-token'],
      };
    } catch {
      // empty on purpose
    }
  }

  throw new Error('nitro-testnode sequencer not found');
}

const testnodeAccounts = getNitroTestnodePrivateKeyAccounts();
const l2RollupOwner = testnodeAccounts.l2RollupOwner;

const nitroTestnodeL1Client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(nitroTestnodeL1.rpcUrls.default.http[0]),
});

const nitroTestnodeL2Client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(nitroTestnodeL2.rpcUrls.default.http[0]),
});

async function deployTokenBridge (){ 
  const testnodeInformation = getInformationFromTestnode();
  
// deploy a fresh token bridge creator, because it is only possible to deploy one token bridge per rollup per token bridge creator
const tokenBridgeCreator = await deployTokenBridgeCreator({
  publicClient: nitroTestnodeL1Client,
});

const txRequest = await createTokenBridgePrepareTransactionRequest({
  params: {
    rollup: testnodeInformation.rollup,
    rollupOwner: l2RollupOwner.address,
  },
  parentChainPublicClient: nitroTestnodeL1Client,
  orbitChainPublicClient: nitroTestnodeL2Client,
  account: l2RollupOwner.address,
  gasOverrides: {
    gasLimit: {
      base: 6_000_000n,
    },
  },
  retryableGasOverrides: {
    maxGasForFactory: {
      base: 20_000_000n,
    },
    maxGasForContracts: {
      base: 20_000_000n,
    },
    maxSubmissionCostForFactory: {
      base: 4_000_000_000_000n,
    },
    maxSubmissionCostForContracts: {
      base: 4_000_000_000_000n,
    },
  },
});

// update the transaction request to use the fresh token bridge creator
const txRequestToFreshTokenBridgeCreator = { ...txRequest, to: tokenBridgeCreator };

// sign and send the transaction
const txHash = await nitroTestnodeL1Client.sendRawTransaction({
  serializedTransaction: await l2RollupOwner.signTransaction(txRequestToFreshTokenBridgeCreator),
});

// get the transaction receipt after waiting for the transaction to complete
const txReceipt = createTokenBridgePrepareTransactionReceipt(
  await nitroTestnodeL1Client.waitForTransactionReceipt({ hash: txHash }),
);
// checking retryables execution
const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
  orbitPublicClient: nitroTestnodeL2Client,
});
// get contracts
const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
  parentChainPublicClient: nitroTestnodeL1Client,
});

return tokenBridgeContracts.orbitChainContracts.upgradeExecutor
}

it('successfully fetches network fee receiver', async () => {
  const result = await client.arbOwnerReadContract({
    functionName: 'getNetworkFeeAccount',
  });

  expect(result).toEqual(owner.address);
});

it('succesfully fetches chain owners', async () => {
  const result = await client.arbOwnerReadContract({
    functionName: 'getAllChainOwners',
  });

  expect(result).toContain(owner.address);
});

it('succesfully adds chain owner', async () => {
  const upgradeExecutorAddress = await deployTokenBridge()
  const isOwnerInitially = await client.arbOwnerReadContract({
    functionName: 'isChainOwner',
    args: [randomAccount.address],
  });

  // assert account is not already an owner
  expect(isOwnerInitially).toEqual(false);

  const transactionRequest = await client.arbOwnerPrepareTransactionRequest({
    functionName: 'addChainOwner',
    args: [randomAccount.address],
    upgradeExecutor: upgradeExecutorAddress,
    account: owner.address,
  });

  // submit tx to add chain owner
  await client.sendRawTransaction({
    // @ts-ignore
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
  const upgradeExecutorAddress = await deployTokenBridge()
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
  const upgradeExecutorAddress = await deployTokenBridge()
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
