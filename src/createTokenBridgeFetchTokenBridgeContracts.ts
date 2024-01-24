import { Address, PublicClient } from 'viem';
import { validParentChainId } from './types/ParentChain';
import { tokenBridgeCreator } from './contracts';
import { TokenBridgeContracts } from './types/TokenBridgeContracts';

export type CreateTokenBridgeFetchTokenBridgeContractsParams = {
  inbox: Address;
  parentChainPublicClient: PublicClient;
};

export async function createTokenBridgeFetchTokenBridgeContracts({
  inbox,
  parentChainPublicClient,
}: CreateTokenBridgeFetchTokenBridgeContractsParams): Promise<TokenBridgeContracts> {
  const chainId = parentChainPublicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  // getting parent chain addresses
  const [
    parentChainRouter,
    parentChainStandardGateway,
    parentChainCustomGateway,
    parentChainWethGateway,
    parentChainWeth,
  ] = await parentChainPublicClient.readContract({
    address: tokenBridgeCreator.address[chainId],
    abi: tokenBridgeCreator.abi,
    functionName: 'inboxToL1Deployment',
    args: [inbox],
  });

  const parentChainMulticall = await parentChainPublicClient.readContract({
    address: tokenBridgeCreator.address[chainId],
    abi: tokenBridgeCreator.abi,
    functionName: 'l1Multicall',
  });

  const parentChainContracts = {
    router: parentChainRouter,
    standardGateway: parentChainStandardGateway,
    customGateway: parentChainCustomGateway,
    wethGateway: parentChainWethGateway,
    weth: parentChainWeth,
    multicall: parentChainMulticall,
  };

  // getting child chain addresses
  const [
    childChainRouter,
    childChainStandardGateway,
    childChainCustomGateway,
    childChainWethGateway,
    childChainWeth,
    childChainProxyAdmin,
    childChainBeaconProxyFactory,
    childChainUpgradeExecutor,
    childChainMulticall,
  ] = await parentChainPublicClient.readContract({
    address: tokenBridgeCreator.address[chainId],
    abi: tokenBridgeCreator.abi,
    functionName: 'inboxToL2Deployment',
    args: [inbox],
  });
  const childChainContracts = {
    router: childChainRouter,
    standardGateway: childChainStandardGateway,
    customGateway: childChainCustomGateway,
    wethGateway: childChainWethGateway,
    weth: childChainWeth,
    proxyAdmin: childChainProxyAdmin,
    beaconProxyFactory: childChainBeaconProxyFactory,
    upgradeExecutor: childChainUpgradeExecutor,
    multicall: childChainMulticall,
  };

  return {
    parentChainContracts,
    childChainContracts,
  };
}
