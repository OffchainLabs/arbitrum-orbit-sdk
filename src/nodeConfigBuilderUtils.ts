import { ParentChainId } from './types/ParentChain';
import {
  mainnet,
  arbitrumOne,
  arbitrumNova,
  sepolia,
  holesky,
  arbitrumSepolia,
  nitroTestnodeL1,
  nitroTestnodeL2,
  base,
  baseSepolia,
} from './chains';

export function parentChainIsArbitrum(parentChainId: ParentChainId): boolean {
  // doing switch here to make sure it's exhaustive when checking against `ParentChainId`
  switch (parentChainId) {
    case mainnet.id:
    case sepolia.id:
    case holesky.id:
    case base.id:
    case baseSepolia.id:
    case nitroTestnodeL1.id:
      return false;

    case arbitrumOne.id:
    case arbitrumNova.id:
    case arbitrumSepolia.id:
    case nitroTestnodeL2.id:
      return true;
  }
}

export function stringifyJson<TJson>(json: TJson): string {
  return JSON.stringify(json);
}
