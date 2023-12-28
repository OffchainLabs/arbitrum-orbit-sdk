import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { nitroTestnodeL1, nitroTestnodeL2 } from './chains';
import { getTestPrivateKeyAccount, testSetupCreateRollup } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridge';

const deployer = getTestPrivateKeyAccount();

const nitroTestnodeL1Client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(nitroTestnodeL1.rpcUrls.default.http[0]),
});

const nitroTestnodeL2Client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(nitroTestnodeL2.rpcUrls.default.http[0]),
});

it(`successfully deploys token bridge contracts on parent chain`, async () => {
  const createRollupTxReceipt = await testSetupCreateRollup({
    publicClient: nitroTestnodeL1Client,
  });
  const { rollup } = createRollupTxReceipt.getCoreContracts();

  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: { rollup, rollupOwner: deployer.address },
    parentChainPublicClient: nitroTestnodeL1Client,
    childChainPublicClient: nitroTestnodeL2Client,
    account: deployer.address,
  });

  // sign and send the transaction
  const txHash = await nitroTestnodeL1Client.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = await nitroTestnodeL1Client.waitForTransactionReceipt({ hash: txHash });

  expect(txReceipt.status).toEqual('success');
});
