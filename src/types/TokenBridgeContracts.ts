import { Address } from 'viem';

type TokenBridgeParentChainContracts = {
  router: Address;
  standardGateway: Address;
  customGateway: Address;
  wethGateway: Address;
  weth: Address;
  multicall: Address;
};

type TokenBridgeOrbitChainContracts = {
  router: Address;
  standardGateway: Address;
  customGateway: Address;
  wethGateway: Address;
  weth: Address;
  proxyAdmin: Address;
  beaconProxyFactory: Address;
  upgradeExecutor: Address;
  multicall: Address;
};

export type TokenBridgeContracts = {
  parentChainContracts: TokenBridgeParentChainContracts;
  orbitChainContracts: TokenBridgeOrbitChainContracts;
};
