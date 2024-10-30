import { JsonRpcProvider } from '@ethersproject/providers';
import {
  ArbitrumNetwork,
  getArbitrumNetworkInformationFromRollup,
  registerCustomArbitrumNetwork,
} from '@arbitrum/sdk';
import { testnets } from '../chains';
import { getRollupInitializedEvents } from '../createRollupFetchTransactionHash';
import { Address, Chain, PublicClient, Transport } from 'viem';
import { publicClientToProvider } from '../ethers-compat/publicClientToProvider';

const isTestnet = (parentChainId: number) => {
  return testnets.some((testnet) => testnet.id === parentChainId);
};

export async function prepareRegisterNewNetworkParams<TChain extends Chain | undefined>(
  parentChainPublicClient: PublicClient<Transport, TChain>,
  rollupAddress: Address,
): Promise<ArbitrumNetwork> {
  const rollupInitializedEvent = await getRollupInitializedEvents({
    rollup: rollupAddress,
    publicClient: parentChainPublicClient,
  });
  const { chainId } = rollupInitializedEvent[0].args;

  if (!chainId) {
    throw new Error("RollupInitialized event doesn't contain chainId");
  }

  const { parentChainId, ethBridge, confirmPeriodBlocks } =
    await getArbitrumNetworkInformationFromRollup(
      rollupAddress,
      publicClientToProvider(parentChainPublicClient),
    );

  return {
    name: String(`${chainId}-arbitrum-network`),
    chainId: Number(chainId),
    parentChainId,
    confirmPeriodBlocks,
    ethBridge,
    isCustom: true,
    isTestnet: isTestnet(parentChainId),
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

export const registerNewNetworkFromParentPublicClient = async <TChain extends Chain | undefined>(
  parentChainPublicClient: PublicClient<Transport, TChain>,
  rollupAddress: Address,
): Promise<ArbitrumNetwork> => {
  const arbitrumNetwork = await prepareRegisterNewNetworkParams(
    parentChainPublicClient,
    rollupAddress,
  );
  return registerCustomArbitrumNetwork(arbitrumNetwork);
};
