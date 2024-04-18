import { JsonRpcProvider } from '@ethersproject/providers';
import { Network } from '@ethersproject/networks';
import { ArbitrumNetwork, getArbitrumNetwork, addCustomArbitrumNetwork } from '@arbitrum/sdk';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';

async function createArbitrumNetwork({
  rollupAddress,
  parentProvider,
  parentNetwork,
  childNetwork,
}: {
  rollupAddress: string;
  parentProvider: JsonRpcProvider;
  parentNetwork: Network;
  childNetwork: Network;
}): Promise<ArbitrumNetwork> {
  const rollup = RollupAdminLogic__factory.connect(rollupAddress, parentProvider);

  return {
    name: 'OrbitChain',
    parentChainId: parentNetwork.chainId,
    chainId: childNetwork.chainId,
    confirmPeriodBlocks: (await rollup.confirmPeriodBlocks()).toNumber(),
    ethBridge: {
      bridge: await rollup.bridge(),
      inbox: await rollup.inbox(),
      outbox: await rollup.outbox(),
      rollup: rollup.address,
      sequencerInbox: await rollup.sequencerInbox(),
    },
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
    const parentNetworkInfo = await parentProvider.getNetwork();
    const childNetworkInfo = await childProvider.getNetwork();

    const arbitrumNetwork = await createArbitrumNetwork({
      rollupAddress,
      parentProvider,
      parentNetwork: parentNetworkInfo,
      childNetwork: childNetworkInfo,
    });

    addCustomArbitrumNetwork(arbitrumNetwork);

    return arbitrumNetwork;
  }
};
