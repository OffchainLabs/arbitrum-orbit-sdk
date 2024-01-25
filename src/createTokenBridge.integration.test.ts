import { it, expect } from 'vitest';
import { createPublicClient, http, zeroAddress } from 'viem';
import { execSync } from 'node:child_process';

import { nitroTestnodeL1, nitroTestnodeL2 } from './chains';
import { getTestPrivateKeyAccount } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import { deployTokenBridgeCreator } from './createTokenBridge-testHelpers';

function getRollupData() {
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

      const sequencerConfigJson = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/sequencer_config.json').toString(),
      );

      return {
        rollup: deploymentJson['rollup'],
        // this works because rollup owner, batch poster is all the same
        //
        // https://github.com/OffchainLabs/nitro-testnode/blob/master/test-node.bash#L363
        rollupOwner: sequencerConfigJson['node']['batch-poster']['parent-chain-wallet']['account'],
      };
    } catch {
      // empty on purpose
    }
  }

  throw new Error('nitro-testnode sequencer not found');
}

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
  const { rollup, rollupOwner } = getRollupData();

  // deploy a fresh token bridge creator, because it is only possible to deploy one token bridge per rollup per token bridge creator
  const tokenBridgeCreator = await deployTokenBridgeCreator({
    publicClient: nitroTestnodeL1Client,
  });

  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: {
      rollup,
      rollupOwner,
    },
    parentChainPublicClient: nitroTestnodeL1Client,
    childChainPublicClient: nitroTestnodeL2Client,
    account: deployer.address,
  });

  // update the transaction request to use the fresh token bridge creator
  const txRequestToFreshTokenBridgeCreator = { ...txRequest, to: tokenBridgeCreator };

  // sign and send the transaction
  const txHash = await nitroTestnodeL1Client.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(txRequestToFreshTokenBridgeCreator),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await nitroTestnodeL1Client.waitForTransactionReceipt({ hash: txHash }),
  );

  function waitForRetryables() {
    return txReceipt.waitForRetryables({ orbitPublicClient: nitroTestnodeL2Client });
  }

  expect(txReceipt.status).toEqual('success');
  // assert promise is resolved with 2 retryables
  await expect(waitForRetryables()).resolves.toHaveLength(2);

  // get contracts
  const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
    parentChainPublicClient: nitroTestnodeL1Client,
  });
  expect(Object.keys(tokenBridgeContracts)).toHaveLength(2);

  // parent chain contracts
  expect(Object.keys(tokenBridgeContracts.parentChainContracts)).toHaveLength(6);
  expect(tokenBridgeContracts.parentChainContracts.router).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.standardGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.customGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.wethGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.weth).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.multicall).not.toEqual(zeroAddress);

  // child chain contracts
  expect(Object.keys(tokenBridgeContracts.childChainContracts)).toHaveLength(9);
  expect(tokenBridgeContracts.childChainContracts.router).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.standardGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.customGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.wethGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.weth).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.proxyAdmin).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.beaconProxyFactory).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.upgradeExecutor).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.multicall).not.toEqual(zeroAddress);
});
