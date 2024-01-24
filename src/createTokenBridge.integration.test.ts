import { it, expect } from 'vitest';
import { createPublicClient, http, parseAbi, zeroAddress } from 'viem';
import { execSync } from 'node:child_process';

import { nitroTestnodeL1, nitroTestnodeL2 } from './chains';
import { getTestPrivateKeyAccount } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import { deployTokenBridgeCreator } from './createTokenBridge-testHelpers';
import { createTokenBridgeFetchTokenBridgeContracts } from './createTokenBridgeFetchTokenBridgeContracts';
import { createRollupFetchCoreContracts } from './createRollupFetchCoreContracts';

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
  const coreContracts = await createRollupFetchCoreContracts({
    rollup,
    publicClient: nitroTestnodeL1Client,
  });

  const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
    inbox: coreContracts.inbox,
    parentChainPublicClient: nitroTestnodeL1Client,
  });

  // check parent chain contracts

  // parent chain router
  const [
    inboxFromParentChainRouter,
    routerFromParentChainRouter,
    defaultGatewayFromParentChainRouter,
    counterpartGatewayFromParentChainRouter,
  ] = await Promise.all(
    ['inbox', 'router', 'defaultGateway', 'counterpartGateway'].map(async (functionName) => {
      const address = await nitroTestnodeL1Client.readContract({
        address: tokenBridgeContracts.parentChainContracts.router,
        abi: parseAbi([
          'function inbox() public view returns (address)',
          'function router() public view returns (address)',
          'function defaultGateway() public view returns (address)',
          'function counterpartGateway() public view returns (address)',
        ]),
        functionName: functionName as 'inbox' | 'router' | 'defaultGateway' | 'counterpartGateway',
      });

      return address;
    }),
  );
  expect(inboxFromParentChainRouter).toEqual(coreContracts.inbox);
  expect(routerFromParentChainRouter).toEqual(zeroAddress);
  expect(defaultGatewayFromParentChainRouter).toEqual(
    tokenBridgeContracts.parentChainContracts.standardGateway,
  );
  expect(counterpartGatewayFromParentChainRouter).toEqual(
    tokenBridgeContracts.childChainContracts.router,
  );

  // parent chain standard gateway
  const [
    inboxFromParentChainStandardGateway,
    routerFromParentChainStandardGateway,
    counterpartGatewayFromParentChainStandardGateway,
    whitelistFromParentChainStandardGateway,
    l2BeaconProxyFactoryFromParentChainStandardGateway,
    cloneableProxyHashFromParentChainStandardGateway,
  ] = await Promise.all(
    [
      'inbox',
      'router',
      'counterpartGateway',
      'whitelist',
      'l2BeaconProxyFactory',
      'cloneableProxyHash',
    ].map(async (functionName) => {
      const address = await nitroTestnodeL1Client.readContract({
        address: tokenBridgeContracts.parentChainContracts.standardGateway,
        abi: parseAbi([
          'function inbox() public view returns (address)',
          'function router() public view returns (address)',
          'function counterpartGateway() public view returns (address)',
          'function whitelist() public view returns (address)',
          'function l2BeaconProxyFactory() public view returns (address)',
          'function cloneableProxyHash() public view returns (address)',
        ]),
        functionName: functionName as
          | 'inbox'
          | 'router'
          | 'counterpartGateway'
          | 'whitelist'
          | 'l2BeaconProxyFactory'
          | 'cloneableProxyHash',
      });

      return address;
    }),
  );
  expect(inboxFromParentChainStandardGateway).toEqual(coreContracts.inbox);
  expect(routerFromParentChainStandardGateway).toEqual(
    tokenBridgeContracts.parentChainContracts.router,
  );
  expect(counterpartGatewayFromParentChainStandardGateway).toEqual(
    tokenBridgeContracts.childChainContracts.standardGateway,
  );
  expect(whitelistFromParentChainStandardGateway).toEqual(zeroAddress);
  // expect(l2BeaconProxyFactoryFromParentChainStandardGateway).toEqual(tokenBridgeContracts.childChainContracts.router);
  // expect(cloneableProxyHashFromParentChainStandardGateway).toEqual(tokenBridgeContracts.childChainContracts.router);

  console.log(tokenBridgeContracts);
  expect(true).toEqual(true);
});
