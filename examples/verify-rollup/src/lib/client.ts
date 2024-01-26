import { BlockNumber, BlockTag, Hex, PublicClient, createPublicClient, http } from 'viem';
import { defineChainInformation, getChainInfoFromChainId } from '../lib/utils';
import { Abi, AbiEventItem } from './types';

export type ChainLayer = 'parent' | 'orbit';

export class OrbitHandler {
  parentChainPublicClient: PublicClient;
  orbitPublicClient: PublicClient | undefined;

  constructor(parentChainId: number, parentChainRpc?: string, orbitChainId?: number, orbitChainRpc?: string) {
    // Create parent chain client
    const parentChainInformation = getChainInfoFromChainId(parentChainId);
    this.parentChainPublicClient = createPublicClient({
      chain: parentChainInformation,
      transport: http(parentChainRpc),
    });

    // Create orbit chain client
    if (orbitChainId && orbitChainRpc) {
      const orbitChainInformation = defineChainInformation(orbitChainId, orbitChainRpc);
      this.orbitPublicClient = createPublicClient({
        chain: orbitChainInformation,
        transport: http(),
      });
    }
  }

  handlesOrbitChain = () => {
    return this.orbitPublicClient ? true : false;
  };

  getParentChainId = async () => {
    return this.parentChainPublicClient.getChainId();
  };

  getBytecode = async (chainLayer: ChainLayer, address: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.getBytecode({
      address,
    });

    return result;
  };

  getStorageAt = async (chainLayer: ChainLayer, address: `0x${string}`, slot: Hex) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.getStorageAt({
      address,
      slot,
    });

    return result;
  };

  getTransaction = async (chainLayer: ChainLayer, transactionHash: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.getTransaction({
      hash: transactionHash,
    });

    return result;
  };

  getTransactionReceipt = async (chainLayer: ChainLayer, transactionHash: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.getTransactionReceipt({
      hash: transactionHash,
    });

    return result;
  };

  readContract = async (
    chainLayer: ChainLayer,
    address: `0x${string}`,
    abi: Abi,
    functionName: string,
    args: any[] = [],
  ) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.readContract({
      address,
      abi,
      functionName,
      args,
    });

    return result;
  };

  getLogs = async (
    chainLayer: ChainLayer,
    address: `0x${string}`,
    eventAbi: AbiEventItem,
    args?: any,
    fromBlock?: BlockNumber | BlockTag,
    toBlock?: BlockNumber | BlockTag,
  ) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.getLogs({
      address,
      event: eventAbi,
      args,
      fromBlock,
      toBlock,
    });

    return result;
  };

  getBlockNumber = async (chainLayer: ChainLayer) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;
    if (!client) {
      throw new Error(`Client for ${chainLayer} is not defined`);
    }
    const result = await client.getBlockNumber();
    return result;
  };
}
