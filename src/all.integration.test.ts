import { it, expect } from 'vitest';
import { createPublicClient, http, parseGwei, zeroAddress } from 'viem';

import { nitroTestnodeL1, nitroTestnodeL2 } from './chains';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

import { getTestPrivateKeyAccount, testSetupCreateRollup } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridge';

const deployer = getTestPrivateKeyAccount();

const nitroTestnodeL1Client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(),
});

const nitroTestnodeL2Client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

it(`successfully deploys core contracts through rollup creator`, async () => {
  const txReceipt = await testSetupCreateRollup();
  const { rollup, inbox } = txReceipt.getCoreContracts();

  await createTokenBridgePrepareTransactionRequest({
    parentPublicClient: nitroTestnodeL1Client,
    orbitPublicClient: nitroTestnodeL2Client,
    params: {
      rollup,
      rollupOwner: deployer.address,
    },
    account: deployer.address,
  });
});
