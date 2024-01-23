import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { nitroTestnodeL1, nitroTestnodeL2 } from './chains';
import { getTestPrivateKeyAccount } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridge';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import { deployTokenBridgeCreator } from './createTokenBridge-testHelpers';

const deployer = getTestPrivateKeyAccount();

const nitroTestnodeL1Client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(nitroTestnodeL1.rpcUrls.default.http[0]),
});

const nitroTestnodeL2Client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(nitroTestnodeL2.rpcUrls.default.http[0]),
});

it(`successfully deploys token bridge contracts through token bridge creator`, async () => {
  // deploy a fresh token bridge creator, because it is only possible to deploy one token bridge per rollup per token bridge creator
  const tokenBridgeCreator = await deployTokenBridgeCreator({
    publicClient: nitroTestnodeL1Client,
  });

  console.log({ tokenBridgeCreator });

  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: {
      // this is the rollup for the nitro testnode L2
      rollup: '0x05e720d41d78ad9e43cd599e2fbf924dac867124',
      // https://github.com/OffchainLabs/nitro-testnode/blob/master/test-node.bash#L363
      // https://github.com/OffchainLabs/nitro-testnode/blob/master/scripts/accounts.ts#L35
      rollupOwner: '0xe2148eE53c0755215Df69b2616E552154EdC584f',
    },
    parentChainPublicClient: nitroTestnodeL1Client,
    childChainPublicClient: nitroTestnodeL2Client,
    account: deployer.address,
  });

  // update the transaction request to use the fresh token bridge creator
  const txRequestToFreshTokenBridgeCreator = { ...txRequest, to: tokenBridgeCreator };

  console.log({ txRequestToFreshTokenBridgeCreator });

  // sign and send the transaction
  const txHash = await nitroTestnodeL1Client.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(txRequestToFreshTokenBridgeCreator),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await nitroTestnodeL1Client.waitForTransactionReceipt({ hash: txHash }),
  );

  console.log({ txReceipt });

  function waitForRetryables() {
    return txReceipt.waitForRetryables({ orbitPublicClient: nitroTestnodeL2Client });
  }

  expect(txReceipt.status).toEqual('success');
  // assert promise is resolved with 2 retryables
  await expect(waitForRetryables()).resolves.toHaveLength(2);
});
