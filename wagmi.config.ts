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
  address: Record<ParentChainId, `0x${string}`>;
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
    version: '1.1.1',
    address: {
      [sepolia.id]: '0x52f5fFCdfE2AEA2dF283c95e6cc668fc84A54057',
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
