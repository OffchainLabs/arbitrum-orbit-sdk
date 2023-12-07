import { erc, etherscan } from '@wagmi/cli/plugins';

import { ParentChainId } from './src';
import { sepolia, arbitrumSepolia } from './src/chains';

if (typeof process.env.ARBISCAN_API_KEY === 'undefined') {
  throw new Error('Missing ARBISCAN_API_KEY environment variable');
}

const apiKey: string = process.env.ARBISCAN_API_KEY;

function sleep(ms: number = 3_000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const blockExplorerApiUrls: Record<ParentChainId, string> = {
  [sepolia.id]: 'https://api-sepolia.etherscan.io/api',
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
  version?: string;
  address: Record<ParentChainId, `0x${string}`> | `0x${string}`;
};

const contracts: ContractConfig[] = [
  {
    name: 'RollupCreator',
    version: '1.1.0',
    address: {
      [sepolia.id]: '0xfbd0b034e6305788007f6e0123cc5eae701a5751',
      [arbitrumSepolia.id]: '0x06E341073b2749e0Bb9912461351f716DeCDa9b0',
    },
  },
  {
    name: 'TokenBridgeCreator',
    version: '1.1.2',
    address: {
      [sepolia.id]: '0x7612718D3143C791B2Ff5c01a9a7D02CEf00AE9c',
      [arbitrumSepolia.id]: '0xb462C69f8f638d2954c9618B03765FC1770190cF',
    },
  },
  {
    name: 'ArbOwner',
    address: '0x0000000000000000000000000000000000000070',
  },
];

function allEqual<T>(array: T[]) {
  return array.every((value) => value === array[0]);
}

export async function assertContractAbisMatch(contract: ContractConfig) {
  // skip check when single address is provided
  if (typeof contract.address === 'string') {
    console.log(`- ${contract.name} ✔`);
    return;
  }

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
    await sleep(); // sleep to avoid rate limiting
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
        chainId: arbitrumSepolia.id,
        apiKey,
        contracts,
        cacheDuration: 0,
      }),
    ],
  };
}
