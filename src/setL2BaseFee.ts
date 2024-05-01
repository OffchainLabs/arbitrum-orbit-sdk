import { PublicClient, WalletClient } from 'viem';
import { getContract } from 'viem';
import { validateParentChain } from './types/ParentChain';
import L1AtomicTokenBridgeCreator from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol/L1AtomicTokenBridgeCreator.json';
import { Interface } from 'ethers/lib/utils';
import { upgradeExecutor } from './contracts';
import { getAddress } from 'viem';
import {
  setL2BaseFeeEnocdeFunctionData,
  setMinimumL2BaseFeeEnocdeFunctionData,
} from './setL2BaseFeeEncodeFunctionData';

export type BaseFeeParams = {
  parentChainClient: PublicClient;
  orbitChainClient: PublicClient;
  orbitChainWalletClient: WalletClient;
  tokenBridgeCreatorAddress: `0x${string}`;
  inboxAddress: `0x${string}`;
};

export type SetL2BaseFeeParams = {
  l2BaseFee: string;
};

export type SetMinimumL2BaseFeeParams = {
  minimumL2BaseFee: string;
};

const arbOwner = '0x0000000000000000000000000000000000000070';

export async function setL2BaseFee({
  parentChainClient,
  orbitChainClient,
  orbitChainWalletClient,
  tokenBridgeCreatorAddress,
  inboxAddress,
  l2BaseFee,
}: BaseFeeParams & SetL2BaseFeeParams) {
  validateParentChain(parentChainClient);
  const account = orbitChainWalletClient.account?.address;

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const upgradeExecutorProxyAddress = await getUpgradeExecutorProxyAddress(
    tokenBridgeCreatorAddress,
    inboxAddress,
    orbitChainClient,
  );

  const { request } = await orbitChainClient.simulateContract({
    address: getAddress(upgradeExecutorProxyAddress),
    abi: upgradeExecutor.abi,
    functionName: 'executeCall',
    args: [
      arbOwner, // target
      setL2BaseFeeEnocdeFunctionData(BigInt(l2BaseFee)), // targetCallData
    ],
    account,
  });

  const hash = await orbitChainWalletClient.writeContract(request);
  const txReceipt = await orbitChainClient.waitForTransactionReceipt({ hash });

  return txReceipt;
}

export async function setMinimumL2BaseFee({
  parentChainClient,
  orbitChainClient,
  orbitChainWalletClient,
  tokenBridgeCreatorAddress,
  inboxAddress,
  minimumL2BaseFee,
}: BaseFeeParams & SetMinimumL2BaseFeeParams) {
  validateParentChain(parentChainClient);
  const account = orbitChainWalletClient.account?.address;

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const upgradeExecutorProxyAddress = await getUpgradeExecutorProxyAddress(
    tokenBridgeCreatorAddress,
    inboxAddress,
    orbitChainClient,
  );

  const { request } = await orbitChainClient.simulateContract({
    address: getAddress(upgradeExecutorProxyAddress),
    abi: upgradeExecutor.abi,
    functionName: 'executeCall',
    args: [
      arbOwner, // target
      setMinimumL2BaseFeeEnocdeFunctionData(BigInt(minimumL2BaseFee)), // targetCallData
    ],
    account,
  });

  const hash = await orbitChainWalletClient.writeContract(request);
  const txReceipt = await orbitChainClient.waitForTransactionReceipt({ hash });

  return txReceipt;
}

async function getUpgradeExecutorProxyAddress(
  tokenBridgeCreatorAddress: `0x${string}`,
  inboxAddress: `0x${string}`,
  publicClient: PublicClient,
): Promise<`0x${string}`> {
  const tokenBridgeCreator = getContract({
    address: tokenBridgeCreatorAddress,
    abi: L1AtomicTokenBridgeCreator.abi,
    publicClient: publicClient,
  });
  const deployment: any = await tokenBridgeCreator.read.inboxToL2Deployment([inboxAddress]);
  return deployment.upgradeExecutor as `0x${string}`;
}
