import { JsonRpcProvider } from '@ethersproject/providers';
import {
  L1Network,
  L2Network,
  addCustomNetwork,
  constants as arbitrumSdkConstants,
} from '@arbitrum/sdk';
import { getL1Network, getL2Network } from '@arbitrum/sdk/dist/lib/dataEntities/networks';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import { isArbitrumChain } from '@arbitrum/sdk/dist/lib/utils/lib';

async function isNetworkRegistered(provider: JsonRpcProvider, { type }: { type: 'L1' | 'L2' }) {
  try {
    if (type === 'L1') {
      await getL1Network(provider);
      return true;
    } else {
      await getL2Network(provider);
      return true;
    }
  } catch (e) {
    return false;
  }
}

export const registerNewNetwork = async (
  parentProvider: JsonRpcProvider,
  childProvider: JsonRpcProvider,
  rollupAddress: string,
): Promise<{
  l1Network: L1Network | Omit<L2Network, 'tokenBridge'>;
  l2Network: Omit<L2Network, 'tokenBridge'>;
}> => {
  const parentNetworkInfo = await parentProvider.getNetwork();
  const childNetworkInfo = await childProvider.getNetwork();

  const rollup = RollupAdminLogic__factory.connect(rollupAddress, parentProvider);
  const childNetwork: L2Network = {
    chainID: childNetworkInfo.chainId,
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
    partnerChainID: parentNetworkInfo.chainId,
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

  // If the parent chain is an Arbitrum chain, we need to register parent and child chain both as L2 chains
  if (await isArbitrumChain(parentProvider)) {
    const isParentNetworkRegistered = await isNetworkRegistered(parentProvider, { type: 'L2' });
    const parentNetwork: Omit<L2Network, 'tokenBridge'> = {
      chainID: parentNetworkInfo.chainId,
      name: parentNetworkInfo.name,
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
      partnerChainIDs: [childNetworkInfo.chainId],
      retryableLifetimeSeconds: 7 * 24 * 60 * 60,
      partnerChainID: 0,
      nitroGenesisBlock: 0,
      nitroGenesisL1Block: 0,
      depositTimeout: 1800000,
      blockTime: arbitrumSdkConstants.ARB_MINIMUM_BLOCK_TIME_IN_SECONDS,
    };

    if (!isParentNetworkRegistered) {
      addCustomNetwork({ customL2Network: parentNetwork as L2Network });
    }

    const isChildNetworkRegistered = await isNetworkRegistered(childProvider, { type: 'L2' });
    if (!isChildNetworkRegistered) {
      addCustomNetwork({ customL2Network: childNetwork });
    }
    return {
      l1Network: parentNetwork,
      l2Network: childNetwork,
    };
  }

  const isParentNetworkRegistered = await isNetworkRegistered(parentProvider, { type: 'L1' });
  const isChildNetworkRegistered = await isNetworkRegistered(childProvider, { type: 'L2' });

  const parentNetwork: L1Network = {
    blockTime: 10,
    chainID: parentNetworkInfo.chainId,
    explorerUrl: '',
    isCustom: true,
    name: parentNetworkInfo.name,
    partnerChainIDs: [childNetworkInfo.chainId],
    isArbitrum: false,
  };

  // both networks are already registered, do nothing
  if (isParentNetworkRegistered && isChildNetworkRegistered) {
    return { l1Network: parentNetwork, l2Network: childNetwork };
  }

  if (!isParentNetworkRegistered) {
    // we can assume if parent is not registered, that means the child isn't either, because of this check:
    // https://github.com/OffchainLabs/arbitrum-sdk/blob/main/src/lib/dataEntities/networks.ts#L519
    addCustomNetwork({ customL1Network: parentNetwork, customL2Network: childNetwork });
  } else if (!isChildNetworkRegistered) {
    // parent is already registered, only register the child
    addCustomNetwork({ customL2Network: childNetwork });
  }

  return {
    l1Network: parentNetwork,
    l2Network: childNetwork,
  };
};
