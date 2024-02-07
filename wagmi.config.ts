import { erc, etherscan } from '@wagmi/cli/plugins';
import dotenv from 'dotenv';

import { ParentChainId } from './src';
import {
  sepolia,
  arbitrumSepolia,
  nitroTestnodeL1,
  nitroTestnodeL2,
  nitroTestnodeL3,
} from './src/chains';

dotenv.config();

if (typeof process.env.ARBISCAN_API_KEY === 'undefined') {
  throw new Error('Missing ARBISCAN_API_KEY environment variable');
}

const apiKey: string = process.env.ARBISCAN_API_KEY;

function sleep(ms: number = 3_000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const blockExplorerApiUrls: Record<ParentChainId, string> = {
  // testnet
  [sepolia.id]: 'https://api-sepolia.etherscan.io/api',
  [arbitrumSepolia.id]: 'https://api-sepolia.arbiscan.io/api',
  // local nitro-testnode / fine to omit these as we skip abi fetch
  [nitroTestnodeL1.id]: '',
  [nitroTestnodeL2.id]: '',
  [nitroTestnodeL3.id]: '',
};

export async function fetchAbi(chainId: ParentChainId, address: `0x${string}`) {
  await (
    await fetch(
      `${blockExplorerApiUrls[chainId]}?module=contract&action=getabi&format=raw&address=${address}&apikey=${process.env.ARBISCAN_API_KEY}`,
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
      // testnet
      [sepolia.id]: '0xfbd0b034e6305788007f6e0123cc5eae701a5751',
      [arbitrumSepolia.id]: '0x06E341073b2749e0Bb9912461351f716DeCDa9b0',
      // local nitro-testnode (on "release" branch with --tokenbridge --l3node --l3-token-bridge flags)
      [nitroTestnodeL1.id]: '0x596eabe0291d4cdafac7ef53d16c92bf6922b5e0',
      [nitroTestnodeL2.id]: '0x3BaF9f08bAD68869eEdEa90F2Cc546Bd80F1A651',
      [nitroTestnodeL3.id]: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    name: 'TokenBridgeCreator',
    version: '1.2.0',
    address: {
      // testnet
      [sepolia.id]: '0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570',
      [arbitrumSepolia.id]: '0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E',
      // local nitro-testnode (on "release" branch with --tokenbridge --l3node --l3-token-bridge flags)
      [nitroTestnodeL1.id]: '0x4a2ba922052ba54e29c5417bc979daaf7d5fe4f4',
      [nitroTestnodeL2.id]: '0x38f35af53bf913c439eab06a367e09d6eb253492',
      [nitroTestnodeL3.id]: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    name: 'ArbOwner',
    address: '0x0000000000000000000000000000000000000070',
  },
  {
    name: 'ArbOwnerPublic',
    address: '0x000000000000000000000000000000000000006b',
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
      // don't fetch abis for testnode
      .filter(([chainIdString]) => {
        const chainId = Number(chainIdString);
        return (
          chainId !== nitroTestnodeL1.id &&
          chainId !== nitroTestnodeL2.id &&
          chainId !== nitroTestnodeL3.id
        );
      })
      // fetch abis for all chains
      .map(([chainId, address]) => fetchAbi(Number(chainId) as ParentChainId, address)),
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
