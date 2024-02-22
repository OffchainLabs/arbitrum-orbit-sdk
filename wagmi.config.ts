import { erc, etherscan } from '@wagmi/cli/plugins';
import dotenv from 'dotenv';

import { ParentChainId } from './src';
import {
  mainnet,
  arbitrumOne,
  arbitrumNova,
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
  // mainnet
  [mainnet.id]: 'https://etherscan.io/api',
  [arbitrumOne.id]: 'https://arbiscan.io/api',
  [arbitrumNova.id]: 'https://api-nova.arbiscan.io/api',
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
      // mainnet
      [mainnet.id]: '0x90d68b056c411015eae3ec0b98ad94e2c91419f1',
      [arbitrumOne.id]: '0x9CAd81628aB7D8e239F1A5B497313341578c5F71',
      [arbitrumNova.id]: '0x9CAd81628aB7D8e239F1A5B497313341578c5F71',
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
      // mainnet
      [mainnet.id]: '0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660',
      [arbitrumOne.id]: '0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e',
      [arbitrumNova.id]: '0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14',
      // testnet
      [sepolia.id]: '0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570',
      [arbitrumSepolia.id]: '0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E',
      // local nitro-testnode (on "release" branch with --tokenbridge --l3node --l3-token-bridge flags)
      [nitroTestnodeL1.id]: '0x54B4D4e578E10178a6cA602bdb6df0F213296Af4',
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
