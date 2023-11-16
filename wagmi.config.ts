import { fetch as fetchPlugin } from '@wagmi/cli/plugins';

import { ParentChainId } from './src';
import { arbitrumOne, arbitrumGoerli, arbitrumSepolia } from './src/chains';

const blockExplorerApiUrls: Record<ParentChainId, string> = {
  [arbitrumOne.id]: 'https://api.arbiscan.io/api',
  [arbitrumGoerli.id]: 'https://api-goerli.arbiscan.io/api',
  [arbitrumSepolia.id]: 'https://api-sepolia.arbiscan.io/api',
};

export function getRequestUrl(chainId: ParentChainId, address: `0x${string}`) {
  return `${blockExplorerApiUrls[chainId]}?module=contract&action=getabi&format=raw&address=${address}`;
}

export async function fetchAbi(chainId: ParentChainId, address: `0x${string}`) {
  const response = await fetch(getRequestUrl(chainId, address));
  return await response.json();
}

type ContractConfig = {
  name: string;
  address: Record<ParentChainId, `0x${string}`>;
};

const contracts: ContractConfig[] = [
  {
    name: 'RollupCreator',
    address: {
      [arbitrumOne.id]: '0x9CAd81628aB7D8e239F1A5B497313341578c5F71',
      [arbitrumGoerli.id]: '0x2025FCb2Ee63Fcd60E079c9602f7a25bfcA100EE',
      [arbitrumSepolia.id]: '0x06E341073b2749e0Bb9912461351f716DeCDa9b0',
    },
  },
];

function allEqual<T>(array: T[]) {
  return array.every((value) => value === array[0]);
}

export async function assertContractAbisMatch(contract: ContractConfig) {
  const abis = await Promise.all(
    Object.entries(contract.address)
      // fetch abis for all chains
      .map(([chainId, address]) =>
        fetchAbi(Number(chainId) as ParentChainId, address)
      )
  );

  // make sure all abis are the same
  if (!allEqual(abis.map((abi) => JSON.stringify(abi)))) {
    throw new Error(`- ${contract.name} ERROR`);
  }

  console.log(`- ${contract.name} ✔`);
}

function request(config: ContractConfig) {
  // since we'll make sure that all contracts have same abis, it doesn't really matter which one we choose
  const chainId = arbitrumGoerli.id;
  const address = config.address[chainId];

  return { url: getRequestUrl(chainId, address) };
}

export default async function () {
  console.log(`Checking if contract ABIs match...`);

  for (const contract of contracts) {
    await assertContractAbisMatch(contract);
  }

  return {
    out: 'src/generated.ts',
    plugins: [
      fetchPlugin({
        request,
        contracts,
        cacheDuration: 0,
      }),
    ],
  };
}
