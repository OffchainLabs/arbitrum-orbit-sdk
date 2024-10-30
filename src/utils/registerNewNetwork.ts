import { JsonRpcProvider } from '@ethersproject/providers';
import {
  ArbitrumNetwork,
  getArbitrumNetworkInformationFromRollup,
  registerCustomArbitrumNetwork,
} from '@arbitrum/sdk';
import { testnets } from '../chains';
import {
  createRollupFetchTransactionHash,
  getRollupInitializedEvents,
} from '../createRollupFetchTransactionHash';
import { Address, Chain, PublicClient, Transport } from 'viem';
import { publicClientToProvider } from '../ethers-compat/publicClientToProvider';
import { createRollupPrepareTransactionReceipt } from '../createRollupPrepareTransactionReceipt';
import { createTokenBridgeFetchTokenBridgeContracts } from '../createTokenBridgeFetchTokenBridgeContracts';

const isTestnet = (parentChainId: number) => {
  return testnets.some((testnet) => testnet.id === parentChainId);
};

export async function prepareRegisterNewNetworkParams<TChain extends Chain | undefined>({
  parentChainPublicClient,
  rollupAddress,
}: {
  parentChainPublicClient: PublicClient<Transport, TChain>;
  rollupAddress: Address;
}): Promise<ArbitrumNetwork> {
  const rollupInitializedEvent = await getRollupInitializedEvents({
    rollup: rollupAddress,
    publicClient: parentChainPublicClient,
  });

  // Fetch orbit chain chainId
  const { chainId } = rollupInitializedEvent[0].args;
  if (!chainId) {
    throw new Error("RollupInitialized event doesn't contain chainId");
  }

  // Fetch native token address and TokenBridge address
  const rollupCreationtransactionHash = await createRollupFetchTransactionHash({
    rollup: rollupAddress,
    publicClient: parentChainPublicClient,
  });
  const transactionReceipt = createRollupPrepareTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({
      hash: rollupCreationtransactionHash,
    }),
  );
  const { nativeToken, inbox, adminProxy } = transactionReceipt.getCoreContracts();
  const { parentChainId, ethBridge, confirmPeriodBlocks } =
    await getArbitrumNetworkInformationFromRollup(
      rollupAddress,
      publicClientToProvider(parentChainPublicClient),
    );
  const { parentChainContracts, orbitChainContracts } =
    await createTokenBridgeFetchTokenBridgeContracts({
      inbox,
      parentChainPublicClient,
    });

  return {
    name: String(`${chainId}-arbitrum-network`),
    chainId: Number(chainId),
    parentChainId,
    confirmPeriodBlocks,
    ethBridge,
    isCustom: true,
    isTestnet: isTestnet(parentChainId),
    nativeToken,
    tokenBridge: {
      parentGatewayRouter: parentChainContracts.router,
      childGatewayRouter: orbitChainContracts.router,
      parentErc20Gateway: parentChainContracts.standardGateway,
      childErc20Gateway: orbitChainContracts.standardGateway,
      parentCustomGateway: parentChainContracts.customGateway,
      childCustomGateway: orbitChainContracts.customGateway,
      parentWethGateway: parentChainContracts.wethGateway,
      childWethGateway: orbitChainContracts.wethGateway,
      parentWeth: parentChainContracts.weth,
      childWeth: orbitChainContracts.weth,
      parentProxyAdmin: adminProxy,
      childProxyAdmin: orbitChainContracts.proxyAdmin,
      parentMultiCall: parentChainContracts.multicall,
      childMultiCall: orbitChainContracts.multicall,
    },
    retryableLifetimeSeconds: 7 * 24 * 60 * 60, // 7 days
  } satisfies ArbitrumNetwork;
}

export const registerNewNetwork = async (
  parentProvider: JsonRpcProvider,
  childProvider: JsonRpcProvider,
  rollupAddress: string,
): Promise<ArbitrumNetwork> => {
  const chainId = (await childProvider.getNetwork()).chainId;
  const { parentChainId, ethBridge, confirmPeriodBlocks } =
    await getArbitrumNetworkInformationFromRollup(rollupAddress, parentProvider);

  const arbitrumNetwork: ArbitrumNetwork = {
    name: String(`${chainId}-arbitrum-network`),
    chainId,
    parentChainId,
    confirmPeriodBlocks,
    ethBridge,
    isCustom: true,
    isTestnet: isTestnet(parentChainId),
  };

  return registerCustomArbitrumNetwork(arbitrumNetwork);
};

export const registerNewNetworkFromParentPublicClient = async <TChain extends Chain | undefined>({
  parentChainPublicClient,
  rollupAddress,
}: {
  parentChainPublicClient: PublicClient<Transport, TChain>;
  rollupAddress: Address;
}): Promise<ArbitrumNetwork> => {
  const arbitrumNetwork = await prepareRegisterNewNetworkParams({
    parentChainPublicClient,
    rollupAddress,
  });
  return registerCustomArbitrumNetwork(arbitrumNetwork);
};
