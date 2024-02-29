import { it, expect } from 'vitest';
import {
  createPublicClient,
  encodeFunctionData,
  http,
  parseEther,
  zeroAddress,
  parseAbi,
} from 'viem';
import { execSync } from 'node:child_process';

import { nitroTestnodeL1, nitroTestnodeL2, nitroTestnodeL3 } from './chains';
import { getNitroTestnodePrivateKeyAccounts } from './testHelpers';
import { createTokenBridgePrepareTransactionRequest } from './createTokenBridgePrepareTransactionRequest';
import { createTokenBridgePrepareTransactionReceipt } from './createTokenBridgePrepareTransactionReceipt';
import { deployTokenBridgeCreator } from './createTokenBridge-testHelpers';
import { CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams } from './createTokenBridgeEnoughCustomFeeTokenAllowance';
import { createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest } from './createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest';
import { erc20 } from './contracts';
import { createTokenBridgePrepareSetWethGatewayTransactionRequest } from './createTokenBridgePrepareSetWethGatewayTransactionRequest';
import { createTokenBridgePrepareSetWethGatewayTransactionReceipt } from './createTokenBridgePrepareSetWethGatewayTransactionReceipt';

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
    tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
  });

  // sign and send the transaction
  const txHash = await nitroTestnodeL1Client.sendRawTransaction({
    serializedTransaction: await l2RollupOwner.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await nitroTestnodeL1Client.waitForTransactionReceipt({ hash: txHash }),
  );
  expect(txReceipt.status).toEqual('success');

  // checking retryables execution
  const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
    orbitPublicClient: nitroTestnodeL2Client,
  });
  expect(orbitChainRetryableReceipts).toHaveLength(2);
  expect(orbitChainRetryableReceipts[0].status).toEqual('success');
  expect(orbitChainRetryableReceipts[1].status).toEqual('success');

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

  // orbit chain contracts
  expect(Object.keys(tokenBridgeContracts.orbitChainContracts)).toHaveLength(9);
  expect(tokenBridgeContracts.orbitChainContracts.router).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.standardGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.customGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.wethGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.weth).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.proxyAdmin).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.beaconProxyFactory).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.upgradeExecutor).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.multicall).not.toEqual(zeroAddress);

  // set weth gateway
  const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
    rollup: testnodeInformation.rollup,
    parentChainPublicClient: nitroTestnodeL1Client,
    orbitChainPublicClient: nitroTestnodeL2Client,
    account: l2RollupOwner.address,
    retryableGasOverrides: {
      gasLimit: {
        base: 100_000n,
      },
    },
    tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
  });

  // sign and send the transaction
  const setWethGatewayTxHash = await nitroTestnodeL1Client.sendRawTransaction({
    serializedTransaction: await l2RollupOwner.signTransaction(setWethGatewayTxRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const setWethGatewayTxReceipt = createTokenBridgePrepareSetWethGatewayTransactionReceipt(
    await nitroTestnodeL1Client.waitForTransactionReceipt({ hash: setWethGatewayTxHash }),
  );

  // checking retryables execution
  const orbitChainSetGatewayRetryableReceipt = await setWethGatewayTxReceipt.waitForRetryables({
    orbitPublicClient: nitroTestnodeL2Client,
  });
  expect(orbitChainSetGatewayRetryableReceipt).toHaveLength(1);
  expect(orbitChainSetGatewayRetryableReceipt[0].status).toEqual('success');

  // verify weth gateway (parent chain)
  const registeredWethGatewayOnParentChain = await nitroTestnodeL1Client.readContract({
    address: tokenBridgeContracts.parentChainContracts.router,
    abi: parseAbi(['function l1TokenToGateway(address) view returns (address)']),
    functionName: 'l1TokenToGateway',
    args: [tokenBridgeContracts.parentChainContracts.weth],
  });
  expect(registeredWethGatewayOnParentChain).toEqual(
    tokenBridgeContracts.parentChainContracts.wethGateway,
  );

  // verify weth gateway (orbit chain)
  // Note: we pass the address of the token on the parent chain when asking for the registered gateway on the orbit chain
  const registeredWethGatewayOnOrbitChain = await nitroTestnodeL2Client.readContract({
    address: tokenBridgeContracts.orbitChainContracts.router,
    abi: parseAbi(['function l1TokenToGateway(address) view returns (address)']),
    functionName: 'l1TokenToGateway',
    args: [tokenBridgeContracts.parentChainContracts.weth],
  });
  expect(registeredWethGatewayOnOrbitChain).toEqual(
    tokenBridgeContracts.orbitChainContracts.wethGateway,
  );
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
  // 2. approve custom fee token to be spent by the TokenBridgeCreator
  const allowanceParams: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams = {
    nativeToken: testnodeInformation.l3NativeToken,
    owner: l3RollupOwner.address,
    publicClient: nitroTestnodeL2Client,
    tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
  };

  // sign and send the transaction
  const approvalForTokenBridgeCreatorTxHash = await nitroTestnodeL2Client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(
      await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest(allowanceParams),
    ),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const approvalForNewTokenBridgeCreatorTxReceipt =
    await nitroTestnodeL2Client.waitForTransactionReceipt({
      hash: approvalForTokenBridgeCreatorTxHash,
    });
  expect(approvalForNewTokenBridgeCreatorTxReceipt.status).toEqual('success');

  // -----------------------------
  // 3. create the token bridge
  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: {
      rollup: testnodeInformation.l3Rollup,
      rollupOwner: l3RollupOwner.address,
    },
    parentChainPublicClient: nitroTestnodeL2Client,
    orbitChainPublicClient: nitroTestnodeL3Client,
    account: l3RollupOwner.address,
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
    tokenBridgeCreatorAddressOverride: tokenBridgeCreator,
  });

  // sign and send the transaction
  const txHash = await nitroTestnodeL2Client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await nitroTestnodeL2Client.waitForTransactionReceipt({ hash: txHash }),
  );
  expect(txReceipt.status).toEqual('success');

  // checking retryables execution
  const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
    orbitPublicClient: nitroTestnodeL3Client,
  });
  expect(orbitChainRetryableReceipts).toHaveLength(2);
  expect(orbitChainRetryableReceipts[0].status).toEqual('success');
  expect(orbitChainRetryableReceipts[1].status).toEqual('success');

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

  // orbit chain contracts
  expect(Object.keys(tokenBridgeContracts.orbitChainContracts)).toHaveLength(9);
  expect(tokenBridgeContracts.orbitChainContracts.router).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.standardGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.customGateway).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.proxyAdmin).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.beaconProxyFactory).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.upgradeExecutor).not.toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.multicall).not.toEqual(zeroAddress);

  // wethGateway and weth should be the zeroAddress on custom-fee-token chains
  expect(tokenBridgeContracts.orbitChainContracts.wethGateway).toEqual(zeroAddress);
  expect(tokenBridgeContracts.orbitChainContracts.weth).toEqual(zeroAddress);
});
