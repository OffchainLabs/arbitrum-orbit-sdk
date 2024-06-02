import { Chain, Client, PublicClient, Transport } from 'viem';

import { chains, nitroTestnodeL3 } from '../chains';
import { Prettify } from './utils';

// exclude nitro-testnode L3 from the list of parent chains
export type ParentChain = Exclude<(typeof chains)[number], { id: typeof nitroTestnodeL3.id }>;
export type ParentChainId = ParentChain['id'];

export type ParentChainPublicClient = Prettify<
  Omit<PublicClient, 'chain'> & {
    chain: Prettify<Omit<Chain, 'id'> & { id: ParentChainId }>;
  }
>;

function isValidParentChainId(parentChainId: number | undefined): parentChainId is ParentChainId {
  const ids = chains
    // exclude nitro-testnode L3 from the list of parent chains
    .filter((chain) => chain.id !== nitroTestnodeL3.id)
    .map((chain) => chain.id) as Number[];
  return ids.includes(Number(parentChainId));
}

/**
 * Validates the provided parent chain ID to ensure it is supported by the
 * system. If the parent chain ID is not valid, an error is thrown with a
 * corresponding message. Returns the validated parent chain ID.
 */
export function validateParentChain<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(chainIdOrClient: number | Client<TTransport, TChain>): ParentChainId {
  const chainId = typeof chainIdOrClient === 'number' ? chainIdOrClient : chainIdOrClient.chain?.id;

  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return chainId;
}

/**
 * Validates the parent chain of a {@link PublicClient} to ensure it is
 * supported. If the parent chain is not supported, an error is thrown. Returns
 * a {@link ParentChainPublicClient}.
 */
export function validateParentChainPublicClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(publicClient: PublicClient<TTransport, TChain>): ParentChainPublicClient {
  const chainId = publicClient.chain?.id;

  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return publicClient as ParentChainPublicClient;
}
