import { createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { arbitrumGoerli } from 'viem/chains';

import {
  createRollupPrepareConfig,
  createRollupPrepareChainConfig,
  createRollupPrepareTransactionRequest,
} from '@arbitrum/orbit-sdk';
import { generateChainId } from '@arbitrum/orbit-sdk/utils';

if (typeof process.env.PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "PRIVATE_KEY" environment variable`);
}

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}

const chain = arbitrumGoerli;

const batchPoster = privateKeyToAccount(generatePrivateKey()).address;
const validator = privateKeyToAccount(generatePrivateKey()).address;

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

const account = privateKeyToAccount(
  sanitizePrivateKey(process.env.PRIVATE_KEY)
);

async function main() {
  const chainId = generateChainId();

  const request = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareConfig({
        chainId: BigInt(chainId),
        owner: account.address,
        chainConfig: createRollupPrepareChainConfig({
          chainId,
          arbitrum: {
            InitialChainOwner: account.address,
            DataAvailabilityCommittee: true,
          },
        }),
      }),
      batchPoster,
      validators: [validator],
    },
    account: account.address,
    publicClient,
  });

  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: await account.signTransaction(request),
  });

  const txReceipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log(
    `Rollup deployed in transaction: ${chain.blockExplorers.default.url}/tx/${txReceipt.transactionHash}`
  );
}

main();
