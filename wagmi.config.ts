import { erc, etherscan } from '@wagmi/cli/plugins';

import { ParentChainId } from './src';
import { arbitrumOne, arbitrumGoerli, arbitrumSepolia } from './src/chains';

const blockExplorerApiUrls: Record<ParentChainId, string> = {
  [arbitrumOne.id]: 'https://api.arbiscan.io/api',
  [arbitrumGoerli.id]: 'https://api-goerli.arbiscan.io/api',
  [arbitrumSepolia.id]: 'https://api-sepolia.arbiscan.io/api',
};

export async function fetchAbi(chainId: ParentChainId, address: `0x${string}`) {
  await (
    await fetch(
      `${blockExplorerApiUrls[chainId]}?module=contract&action=getabi&format=raw&address=${address}&apikey=${process.env.ARBISCAN_API_KEY}`
    )
  ).json();
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
  {
    name: 'TokenBridgeCreator',
    address: {
      [arbitrumOne.id]: '0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14',
      [arbitrumGoerli.id]: '0x1C608642d0944e95957a7ac3a478EC17FA191E9A',
      [arbitrumSepolia.id]: '0xC35800028e31044173d37291F425DCc42D068c84',
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

export default async function () {
  console.log(`Checking if contract ABIs match...`);

  for (const contract of contracts) {
    await assertContractAbisMatch(contract);
  }

  return {
    out: 'src/generated.ts',
    plugins: [
      erc({
        20: true,
        721: false,
        4626: false,
      }),
      etherscan({
        chainId: arbitrumOne.id,
        apiKey: process.env.ARBISCAN_API_KEY!,
        contracts,
        cacheDuration: 0,
      }),
    ],
  };
}
