import {
  Chain,
  PublicClient,
  PublicClientConfig,
  Transport,
  createPublicClient,
} from "viem";
import { rollupCreator } from "./contracts";
import { ParentChainId, validParentChainId } from "./types/ParentChain";

export interface OrbitClient extends PublicClient {
  getRollupCreatorAddress(): `0x${string}`;
  getValidChainId(): ParentChainId;
}

export function createOrbitClient({
  chain,
  transport,
}: PublicClientConfig): OrbitClient {
  return createPublicClient({
    chain,
    transport,
  }).extend((client) => ({
    getRollupCreatorAddress: () => {
      const chainId = client.chain?.id;
      if (!validParentChainId(chainId)) {
        throw new Error("chainId is undefined");
      }
      return rollupCreator.address[chainId];
    },
    getValidChainId: () => {
      const chainId = client.chain?.id;
      if (!validParentChainId(chainId)) {
        throw new Error("chainId is undefined");
      }
      return chainId;
    },
  }));
}
