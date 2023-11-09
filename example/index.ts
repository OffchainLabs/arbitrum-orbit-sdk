import { createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { arbitrumGoerli } from 'viem/chains';

import {
  generateChainId,
  createRollupPrepareConfig,
  createRollupPrepareTransactionRequest,
} from '@arbitrum/orbit-sdk';

if (typeof process.env.PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "PRIVATE_KEY" environment variable`);
}

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}

const batchPoster = privateKeyToAccount(generatePrivateKey()).address;
const validator = privateKeyToAccount(generatePrivateKey()).address;

const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

const account = privateKeyToAccount(
  sanitizePrivateKey(process.env.PRIVATE_KEY)
);

async function main() {
  const request = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareConfig({
        chainId: BigInt(generateChainId()),
        owner: account.address,
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

  console.log(`Rollup deployed in transaction: ${txHash}`);
}

main();
