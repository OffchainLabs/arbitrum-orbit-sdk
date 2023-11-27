import { erc, etherscan } from '@wagmi/cli/plugins';

import { ParentChainId } from './src';
import { arbitrumGoerli, sepolia, arbitrumSepolia } from './src/chains';

function sleep(ms: number = 3_000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const blockExplorerApiUrls: Record<ParentChainId, string> = {
  [arbitrumGoerli.id]: 'https://api-goerli.arbiscan.io/api',
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
  address: Record<ParentChainId, `0x${string}`>;
};

const contracts: ContractConfig[] = [
  {
    name: 'RollupCreator',
    address: {
      [arbitrumGoerli.id]: '0x2025FCb2Ee63Fcd60E079c9602f7a25bfcA100EE',
      [sepolia.id]: '0xfbd0b034e6305788007f6e0123cc5eae701a5751',
      [arbitrumSepolia.id]: '0x06E341073b2749e0Bb9912461351f716DeCDa9b0',
    },
  },
  {
    name: 'TokenBridgeCreator',
    address: {
      [arbitrumGoerli.id]: '0x1C608642d0944e95957a7ac3a478EC17FA191E9A',
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
        chainId: arbitrumGoerli.id,
        apiKey: process.env.ARBISCAN_API_KEY!,
        contracts,
        cacheDuration: 0,
      }),
    ],
  };
}
