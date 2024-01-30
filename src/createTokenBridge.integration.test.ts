import { it, expect } from 'vitest';
import {
  createPublicClient,
  encodeFunctionData,
  http,
  maxInt256,
  parseEther,
  zeroAddress,
} from 'viem';
import { execSync } from 'node:child_process';

import { nitroTestnodeL1, nitroTestnodeL2, nitroTestnodeL3 } from './chains';
import { getNitroTestnodePrivateKeyAccounts } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import { deployTokenBridgeCreator } from './createTokenBridge-testHelpers';
import { createTokenBridgeEnoughCustomFeeTokenAllowance } from './createTokenBridgeEnoughCustomFeeTokenAllowance';
import { createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest } from './createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest';
import { erc20 } from './contracts';

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
const deployer = testnodeAccounts.deployer;
const l2RollupOwner = testnodeAccounts.l2RollupOwner;
const l3RollupOwner = testnodeAccounts.l3RollupOwner;
const l3TokenBridgeDeployer = testnodeAccounts.l3TokenBridgeDeployer;

const nitroTestnodeL1Client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(nitroTestnodeL1.rpcUrls.default.http[0]),
});

const nitroTestnodeL2Client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(nitroTestnodeL2.rpcUrls.default.http[0]),
});

const nitroTestnodeL3Client = createPublicClient({
  chain: nitroTestnodeL3,
  transport: http(nitroTestnodeL3.rpcUrls.default.http[0]),
});

it(`successfully deploys token bridge contracts through token bridge creator`, async () => {
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

it(`successfully deploys token bridge contracts with a custom fee token through token bridge creator`, async () => {
  const testnodeInformation = getInformationFromTestnode();

  // deploy a fresh token bridge creator, because it is only possible to deploy one token bridge per rollup per token bridge creator
  const tokenBridgeCreator = await deployTokenBridgeCreator({
    publicClient: nitroTestnodeL2Client,
  });

  // -----------------------------
  // 1. fund l3deployer account
  const fundTxRequestRaw = await nitroTestnodeL2Client.prepareTransactionRequest({
    chain: nitroTestnodeL2Client.chain,
    to: testnodeInformation.l3NativeToken,
    data: encodeFunctionData({
      abi: erc20.abi,
      functionName: 'transfer',
      args: [l3RollupOwner.address, parseEther('500')],
    }),
    value: BigInt(0),
    account: l3TokenBridgeDeployer,
  });

  // sign and send the transaction
  const fundTxRequest = { ...fundTxRequestRaw, chainId: nitroTestnodeL2Client.chain.id };
  const fundTxHash = await nitroTestnodeL2Client.sendRawTransaction({
    serializedTransaction: await l3TokenBridgeDeployer.signTransaction(fundTxRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const fundTxReceipt = await nitroTestnodeL2Client.waitForTransactionReceipt({
    hash: fundTxHash,
  });
  expect(fundTxReceipt.status).toEqual('success');

  // -----------------------------
  // 2. check token bridge creator allowance
  const allowanceParams = {
    nativeToken: testnodeInformation.l3NativeToken,
    account: l3RollupOwner.address,
    publicClient: nitroTestnodeL2Client,
  };
  if (!(await createTokenBridgeEnoughCustomFeeTokenAllowance(allowanceParams))) {
    const approvalTxRequest =
      await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(allowanceParams);

    // update the transaction request to use the fresh token bridge creator
    approvalTxRequest.data = encodeFunctionData({
      abi: erc20.abi,
      functionName: 'approve',
      args: [tokenBridgeCreator, maxInt256],
    });

    // sign and send the transaction
    const approvalTxHash = await nitroTestnodeL2Client.sendRawTransaction({
      serializedTransaction: await l3RollupOwner.signTransaction(approvalTxRequest),
    });

    // get the transaction receipt after waiting for the transaction to complete
    const approvalTxReceipt = await nitroTestnodeL2Client.waitForTransactionReceipt({
      hash: approvalTxHash,
    });
    expect(approvalTxReceipt.status).toEqual('success');
  }

  // -----------------------------
  // 3. create the token bridge
  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: {
      rollup: testnodeInformation.l3Rollup,
      rollupOwner: l3RollupOwner.address,
    },
    parentChainPublicClient: nitroTestnodeL2Client,
    childChainPublicClient: nitroTestnodeL3Client,
    account: l3RollupOwner.address,
  });

  // update the transaction request to use the fresh token bridge creator
  const txRequestToFreshTokenBridgeCreator = { ...txRequest, to: tokenBridgeCreator };

  // sign and send the transaction
  const txHash = await nitroTestnodeL2Client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(txRequestToFreshTokenBridgeCreator),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await nitroTestnodeL2Client.waitForTransactionReceipt({ hash: txHash }),
  );

  function waitForRetryables() {
    return txReceipt.waitForRetryables({ orbitPublicClient: nitroTestnodeL3Client });
  }

  expect(txReceipt.status).toEqual('success');
  // assert promise is resolved with 2 retryables
  await expect(waitForRetryables()).resolves.toHaveLength(2);

  // get contracts
  const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
    parentChainPublicClient: nitroTestnodeL2Client,
  });
  expect(Object.keys(tokenBridgeContracts)).toHaveLength(2);

  // parent chain contracts
  expect(Object.keys(tokenBridgeContracts.parentChainContracts)).toHaveLength(6);
  expect(tokenBridgeContracts.parentChainContracts.router).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.standardGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.customGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.parentChainContracts.multicall).not.toEqual(zeroAddress);

  // child chain contracts
  expect(Object.keys(tokenBridgeContracts.childChainContracts)).toHaveLength(9);
  expect(tokenBridgeContracts.childChainContracts.router).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.standardGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.customGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.proxyAdmin).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.beaconProxyFactory).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.upgradeExecutor).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.childChainContracts.multicall).not.toEqual(zeroAddress);
});
