import { PublicClient } from 'viem';
import { chains } from '../chains';

type ChainId = (typeof chains)[number]['id'];

function isValidChainId(chainId: number | undefined): chainId is ChainId {
  const ids = chains.map((chain) => chain.id) as Number[];
  return ids.includes(Number(chainId));
}

export function validateChain(chainIdOrPublicClient: number | PublicClient): ChainId {
  const chainId =
    typeof chainIdOrPublicClient === 'number'
      ? chainIdOrPublicClient
      : chainIdOrPublicClient.chain?.id;

  if (!isValidChainId(chainId)) {
    throw new Error(`Chain not supported: ${chainId}`);
  }

  return chainId;
}
