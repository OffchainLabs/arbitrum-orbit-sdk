import { JsonRpcProvider } from '@ethersproject/providers';
import { Network } from '@ethersproject/networks';
import {
  L1Network,
  L2Network,
  addCustomNetwork,
  constants as arbitrumSdkConstants,
} from '@arbitrum/sdk';
import { getL1Network, getL2Network } from '@arbitrum/sdk/dist/lib/dataEntities/networks';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import { isArbitrumChain } from '@arbitrum/sdk/dist/lib/utils/lib';
import { arbitrum, arbitrumNova, arbitrumSepolia, mainnet, sepolia } from 'viem/chains';
import { nitroTestnodeL1, nitroTestnodeL2 } from '../chains';

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

const parentChainIdFromChildChainId = (childChainId: number) => {
  const parentChainId = {
    [arbitrum.id]: mainnet.id,
    [arbitrumNova.id]: mainnet.id,
    [arbitrumSepolia.id]: sepolia.id,
    [nitroTestnodeL2.id]: nitroTestnodeL1.id,
  }[childChainId];

  if (!parentChainId) {
    throw new Error(`[utils/registernewNetwork] invalid child chain id: ${childChainId}`);
  }

  return parentChainId;
};

async function createChildNetwork({
  rollupAddress,
  parentProvider,
  parentNetwork,
  childNetwork,
}: {
  rollupAddress: string;
  parentProvider: JsonRpcProvider;
  parentNetwork: Network;
  childNetwork: Network;
}): Promise<L2Network> {
  const rollup = RollupAdminLogic__factory.connect(rollupAddress, parentProvider);
  return {
    chainID: childNetwork.chainId,
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
    partnerChainID: parentNetwork.chainId,
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
}

async function createParentNetwork<TIsArbitrum extends boolean>({
  parentNetwork,
  childNetwork,
  isArbitrum,
}: {
  parentNetwork: Network;
  childNetwork: Network;
  isArbitrum: TIsArbitrum;
}): Promise<TIsArbitrum extends true ? L2Network : L1Network>;
async function createParentNetwork<TIsArbitrum>({
  parentNetwork,
  childNetwork,
  isArbitrum,
}: {
  parentNetwork: Network;
  childNetwork: Network;
  isArbitrum: TIsArbitrum;
}): Promise<L1Network | L2Network> {
  if (isArbitrum) {
    return {
      chainID: parentNetwork.chainId,
      name: parentNetwork.name,
      confirmPeriodBlocks: 45818,
      ethBridge: {
        bridge: '',
        inbox: '',
        outbox: '',
        rollup: '',
        sequencerInbox: '',
      },
      tokenBridge: {
        l1GatewayRouter: '',
        l2GatewayRouter: '',
        l1ERC20Gateway: '',
        l2ERC20Gateway: '',
        l1CustomGateway: '',
        l2CustomGateway: '',
        l1WethGateway: '',
        l2WethGateway: '',
        l2Weth: '',
        l1Weth: '',
        l1ProxyAdmin: '',
        l2ProxyAdmin: '',
        l1MultiCall: '',
        l2Multicall: '',
      },
      explorerUrl: '',
      isArbitrum: true,
      isCustom: true,
      partnerChainIDs: [childNetwork.chainId],
      retryableLifetimeSeconds: 7 * 24 * 60 * 60,
      partnerChainID: parentChainIdFromChildChainId(parentNetwork.chainId),
      nitroGenesisBlock: 0,
      nitroGenesisL1Block: 0,
      depositTimeout: 1800000,
      blockTime: arbitrumSdkConstants.ARB_MINIMUM_BLOCK_TIME_IN_SECONDS,
    };
  }

  return {
    blockTime: 10,
    chainID: parentNetwork.chainId,
    explorerUrl: '',
    isCustom: true,
    name: parentNetwork.name,
    partnerChainIDs: [childNetwork.chainId],
    isArbitrum: false,
  };
}

export const registerNewNetwork = async (
  parentProvider: JsonRpcProvider,
  childProvider: JsonRpcProvider,
  rollupAddress: string,
): Promise<{
  parentNetwork: L1Network | L2Network;
  childNetwork: L2Network;
}> => {
  const parentNetworkInfo = await parentProvider.getNetwork();
  const childNetworkInfo = await childProvider.getNetwork();

  const childNetwork = await createChildNetwork({
    rollupAddress,
    parentProvider,
    parentNetwork: parentNetworkInfo,
    childNetwork: childNetworkInfo,
  });

  // If the parent chain is an Arbitrum chain, we need to register parent and child chain both as L2 chains
  if (await isArbitrumChain(parentProvider)) {
    const isParentNetworkRegistered = await isNetworkRegistered(parentProvider, { type: 'L2' });
    const parentNetwork = await createParentNetwork({
      parentNetwork: parentNetworkInfo,
      childNetwork: childNetworkInfo,
      isArbitrum: true,
    });

    if (!isParentNetworkRegistered) {
      addCustomNetwork({ customL2Network: parentNetwork });
    }

    const isChildNetworkRegistered = await isNetworkRegistered(childProvider, { type: 'L2' });
    if (!isChildNetworkRegistered) {
      addCustomNetwork({ customL2Network: childNetwork });
    }
    return {
      parentNetwork,
      childNetwork,
    };
  }

  const isParentNetworkRegistered = await isNetworkRegistered(parentProvider, { type: 'L1' });
  const isChildNetworkRegistered = await isNetworkRegistered(childProvider, { type: 'L2' });

  const parentNetwork = await createParentNetwork({
    parentNetwork: parentNetworkInfo,
    childNetwork: childNetworkInfo,
    isArbitrum: false,
  });

  // both networks are already registered, do nothing
  if (isParentNetworkRegistered && isChildNetworkRegistered) {
    return { parentNetwork, childNetwork };
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
    parentNetwork,
    childNetwork,
  };
};
