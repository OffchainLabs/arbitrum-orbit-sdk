import { Address, PublicClient, zeroAddress } from 'viem';
import { ethers, BigNumber, ContractFactory } from 'ethers';
import { L1Network, L1ToL2MessageGasEstimator, L2Network, addCustomNetwork } from '@arbitrum/sdk';
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json';

import { publicClientToProvider } from './compat/publicClientToProvider';
import { fetchBlaBla } from './fetchCoreContracts';

type NamedFactory = ContractFactory & { contractName: string };

const NamedFactoryInstance = (contractJson: {
  abi: any;
  bytecode: string;
  contractName: string;
}): NamedFactory => {
  const factory = new ContractFactory(contractJson.abi, contractJson.bytecode) as NamedFactory;
  factory['contractName'] = contractJson.contractName;
  return factory;
};

const L2AtomicTokenBridgeFactory__factory = NamedFactoryInstance(L2AtomicTokenBridgeFactory);

export async function deployFactoryEstimateGas({
  account,
  parentChainClient,
  childChainClient,
  rollup,
}: {
  account: Address;
  parentChainClient: PublicClient;
  childChainClient: PublicClient;
  rollup: Address;
}) {
  console.log({ rollup });

  await addCustomNetworkBla({
    parentClient: parentChainClient,
    childClient: childChainClient,
    rollup,
  });

  const parentChainProvider = new ethers.providers.StaticJsonRpcProvider('http://127.0.0.1:8545');
  const parentChainBaseFee = await parentChainProvider.getGasPrice();

  const estimator = new L1ToL2MessageGasEstimator(
    new ethers.providers.StaticJsonRpcProvider('http://127.0.0.1:8547'),
  );

  //// run retryable estimate for deploying L2 factory
  return estimator.estimateAll(
    {
      from: ethers.Wallet.createRandom().address,
      to: zeroAddress,
      l2CallValue: BigNumber.from(0),
      excessFeeRefundAddress: account,
      callValueRefundAddress: account,
      data: L2AtomicTokenBridgeFactory__factory.bytecode,
    },
    parentChainBaseFee,
    parentChainProvider,
  );
}

async function addCustomNetworkBla({
  parentClient,
  childClient,
  rollup,
}: {
  parentClient: PublicClient;
  childClient: PublicClient;
  rollup: Address;
}) {
  const parent = parentClient.chain;
  const child = childClient.chain;

  if (typeof parent === 'undefined' || typeof child === 'undefined') {
    throw new Error('asdf');
  }

  const l1Network: L1Network = {
    blockTime: 10,
    chainID: parent.id,
    explorerUrl: '',
    isCustom: true,
    name: parent.name,
    partnerChainIDs: [child.id],
    isArbitrum: false,
  };

  const { inbox, outbox, bridge, sequencerInbox, confirmPeriodBlocks } = await fetchBlaBla(
    parentClient,
    rollup,
  );

  const l2Network: L2Network = {
    chainID: child.id,
    confirmPeriodBlocks: Number(confirmPeriodBlocks),
    ethBridge: {
      bridge,
      inbox,
      outbox,
      rollup,
      sequencerInbox,
    },
    explorerUrl: '',
    isArbitrum: true,
    isCustom: true,
    name: 'OrbitChain',
    partnerChainID: parent.id,
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
  };

  addCustomNetwork({ customL1Network: l1Network, customL2Network: l2Network });
}
