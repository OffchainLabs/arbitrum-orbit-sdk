import { JsonRpcProvider } from '@ethersproject/providers';
import {
  ArbitrumNetwork,
  getArbitrumNetwork,
  getArbitrumNetworkInformationFromRollup,
  addCustomArbitrumNetwork,
} from '@arbitrum/sdk';

async function createArbitrumNetwork({
  chainId,
  rollupAddress,
  parentProvider,
}: {
  chainId: number;
  rollupAddress: string;
  parentProvider: JsonRpcProvider;
}): Promise<ArbitrumNetwork> {
  const { parentChainId, ethBridge, confirmPeriodBlocks } =
    await getArbitrumNetworkInformationFromRollup(rollupAddress, parentProvider);

  return {
    name: String(`${chainId}-arbitrum-network`),
    chainId,
    parentChainId,
    confirmPeriodBlocks,
    ethBridge,
    tokenBridge: {
      l1CustomGateway: '',
      l1ERC20Gateway: '',
      l1GatewayRouter: '',
      l1MultiCall: '',
      l1ProxyAdmin: '',
      l1Weth: '',
      l1WethGateway: '',
      l2CustomGateway: '',
      l2ERC20Gateway: '',
      l2GatewayRouter: '',
      l2Multicall: '',
      l2ProxyAdmin: '',
      l2Weth: '',
      l2WethGateway: '',
    },
    isCustom: true,
  };
}

export const registerNewNetwork = async (
  parentProvider: JsonRpcProvider,
  childProvider: JsonRpcProvider,
  rollupAddress: string,
): Promise<ArbitrumNetwork> => {
  try {
    return await getArbitrumNetwork(childProvider);
  } catch (err) {
    const arbitrumNetwork = await createArbitrumNetwork({
      chainId: (await childProvider.getNetwork()).chainId,
      rollupAddress,
      parentProvider,
    });

    addCustomArbitrumNetwork(arbitrumNetwork);

    return arbitrumNetwork;
  }
};
