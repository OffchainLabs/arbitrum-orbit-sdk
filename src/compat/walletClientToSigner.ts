import { WalletClient } from 'viem';
import { providers } from 'ethers';

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;

  if (typeof account === 'undefined') {
    throw new Error(`[walletClientToSigner] account is undefined`);
  }

  if (typeof chain === 'undefined') {
    throw new Error(`[walletClientToSigner] chain is undefined`);
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  return new providers.Web3Provider(transport, network).getSigner(account.address);
}
