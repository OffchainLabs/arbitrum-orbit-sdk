import { JsonRpcProvider } from '@ethersproject/providers';
import {
  L1Network,
  L2Network,
  addCustomNetwork,
  constants as arbitrumSdkConstants,
} from '@arbitrum/sdk';
import {
  getL1Network,
  getL2Network,
  l1Networks,
  l2Networks,
} from '@arbitrum/sdk/dist/lib/dataEntities/networks';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';

export const registerNewNetwork = async (
  l1Provider: JsonRpcProvider,
  l2Provider: JsonRpcProvider,
  rollupAddress: string,
): Promise<{
  l1Network: L1Network;
  l2Network: Omit<L2Network, 'tokenBridge'>;
}> => {
  const l1NetworkInfo = await l1Provider.getNetwork();
  const l2NetworkInfo = await l2Provider.getNetwork();

  const l1Network: L1Network = {
    blockTime: 10,
    chainID: l1NetworkInfo.chainId,
    explorerUrl: '',
    isCustom: true,
    name: l1NetworkInfo.name,
    partnerChainIDs: [l2NetworkInfo.chainId],
    isArbitrum: false,
  };

  const rollup = RollupAdminLogic__factory.connect(rollupAddress, l1Provider);
  const l2Network: L2Network = {
    chainID: l2NetworkInfo.chainId,
    confirmPeriodBlocks: (await rollup.confirmPeriodBlocks()).toNumber(),
    ethBridge: {
      bridge: await rollup.bridge(),
      inbox: await rollup.inbox(),
      outbox: await rollup.outbox(),
      rollup: rollup.address,
      sequencerInbox: await rollup.sequencerInbox(),
    },
    explorerUrl: '',
    isArbitrum: true,
    isCustom: true,
    name: 'OrbitChain',
    partnerChainID: l1NetworkInfo.chainId,
    partnerChainIDs: [],
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
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
    blockTime: arbitrumSdkConstants.ARB_MINIMUM_BLOCK_TIME_IN_SECONDS,
  };

  let isL1NetworkRegistered = false;
  try {
    await getL1Network(l1Provider);
    isL1NetworkRegistered = true;
  } catch {
    isL1NetworkRegistered = false;
  }

  let isL2NetworkRegistered = false;
  try {
    await getL2Network(l2Provider);
    isL2NetworkRegistered = true;
  } catch {
    isL2NetworkRegistered = false;
  }

  if (!isL1NetworkRegistered || !isL2NetworkRegistered) {
    // register - needed for retryables
    addCustomNetwork({
      customL1Network: l1Network,
      customL2Network: l2Network,
    });
  }

  return {
    l1Network,
    l2Network,
  };
};
