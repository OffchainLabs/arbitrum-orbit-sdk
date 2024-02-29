import { Address, PublicClient } from 'viem';

import { tokenBridgeCreator } from './contracts';

import { Prettify } from './types/utils';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { TokenBridgeContracts } from './types/TokenBridgeContracts';
import { getTokenBridgeCreatorAddress } from './utils/getters';

export type CreateTokenBridgeFetchTokenBridgeContractsParams = Prettify<
  WithTokenBridgeCreatorAddressOverride<{
    inbox: Address;
    parentChainPublicClient: PublicClient;
  }>
>;

export async function createTokenBridgeFetchTokenBridgeContracts({
  inbox,
  parentChainPublicClient,
  tokenBridgeCreatorAddressOverride,
}: CreateTokenBridgeFetchTokenBridgeContractsParams): Promise<TokenBridgeContracts> {
  const tokenBridgeCreatorAddress =
    tokenBridgeCreatorAddressOverride ?? getTokenBridgeCreatorAddress(parentChainPublicClient);

  // getting parent chain addresses
  const [
    parentChainRouter,
    parentChainStandardGateway,
    parentChainCustomGateway,
    parentChainWethGateway,
    parentChainWeth,
  ] = await parentChainPublicClient.readContract({
    address: tokenBridgeCreatorAddress,
    abi: tokenBridgeCreator.abi,
    functionName: 'inboxToL1Deployment',
    args: [inbox],
  });

  const parentChainMulticall = await parentChainPublicClient.readContract({
    address: tokenBridgeCreatorAddress,
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

  // getting orbit chain addresses
  const [
    orbitChainRouter,
    orbitChainStandardGateway,
    orbitChainCustomGateway,
    orbitChainWethGateway,
    orbitChainWeth,
    orbitChainProxyAdmin,
    orbitChainBeaconProxyFactory,
    orbitChainUpgradeExecutor,
    orbitChainMulticall,
  ] = await parentChainPublicClient.readContract({
    address: tokenBridgeCreatorAddress,
    abi: tokenBridgeCreator.abi,
    functionName: 'inboxToL2Deployment',
    args: [inbox],
  });
  const orbitChainContracts = {
    router: orbitChainRouter,
    standardGateway: orbitChainStandardGateway,
    customGateway: orbitChainCustomGateway,
    wethGateway: orbitChainWethGateway,
    weth: orbitChainWeth,
    proxyAdmin: orbitChainProxyAdmin,
    beaconProxyFactory: orbitChainBeaconProxyFactory,
    upgradeExecutor: orbitChainUpgradeExecutor,
    multicall: orbitChainMulticall,
  };

  return {
    parentChainContracts,
    orbitChainContracts,
  };
}
