import {
  mainnet,
  arbitrumOne,
  arbitrumNova,
  base,
  sepolia,
  holesky,
  arbitrumSepolia,
  baseSepolia,
  nitroTestnodeL1,
  nitroTestnodeL2,
} from '../chains';
import { ParentChainId } from '../types/ParentChain';

const earliestRollupCreatorDeploymentBlockNumber = {
  // mainnet L1
  [mainnet.id]: 18_736_164n,
  // mainnet L2
  [arbitrumOne.id]: 150_599_584n,
  [arbitrumNova.id]: 47_798_739n,
  [base.id]: 12_978_604n,
  // testnet L1
  [sepolia.id]: 4_741_823n,
  [holesky.id]: 1_118_493n,
  // testnet L2
  [arbitrumSepolia.id]: 654_628n,
  [baseSepolia.id]: 10_606_961n,
  // local nitro-testnode
  [nitroTestnodeL1.id]: 0n,
  [nitroTestnodeL2.id]: 0n,
} as const;

export function getEarliestRollupCreatorDeploymentBlockNumber(chainId: ParentChainId) {
  for (const key in earliestRollupCreatorDeploymentBlockNumber) {
    if (chainId.toString() === key) {
      return earliestRollupCreatorDeploymentBlockNumber[chainId];
    }
  }

  return 0n;
}
