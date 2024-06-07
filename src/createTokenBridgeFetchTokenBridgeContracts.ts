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

/**
 * Fetches the token bridge contracts for both the parent chain and the orbit chain.
 *
 * @param {Object} createTokenBridgeFetchTokenBridgeContractsParams - The parameters for fetching token bridge contracts
 * @param {Address} createTokenBridgeFetchTokenBridgeContractsParams.inbox - The inbox address
 * @param {PublicClient} createTokenBridgeFetchTokenBridgeContractsParams.parentChainPublicClient - The parent chain public client
 * @param {Address} [createTokenBridgeFetchTokenBridgeContractsParams.tokenBridgeCreatorAddressOverride] - Optional override for the token bridge creator address
 *
 * @returns {Promise<TokenBridgeContracts>} - The token bridge contracts for both the parent chain and the orbit chain
 *
 * @example
 * const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
 *   inbox: '0xYourInboxAddress',
 *   parentChainPublicClient: yourParentChainPublicClientInstance,
 * });
 */
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
