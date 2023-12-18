import { Chain, createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import {
  createRollupPrepareConfig,
  prepareChainConfig,
  createRollupPrepareTransactionRequest,
  createRollupPrepareTransactionReceipt,
  arbOwnerPublicActions,
} from '@arbitrum/orbit-sdk';
import { generateChainId } from '@arbitrum/orbit-sdk/utils';

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}

function withFallbackPrivateKey(privateKey: string | undefined): `0x${string}` {
  if (typeof privateKey === 'undefined') {
    return generatePrivateKey();
  }

  return sanitizePrivateKey(privateKey);
}

function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}

if (typeof process.env.DEPLOYER_PRIVATE_KEY === 'undefined') {
  throw new Error(
    `Please provide the "DEPLOYER_PRIVATE_KEY" environment variable`
  );
}

// load or generate a random batch poster account
const batchPosterPrivateKey = withFallbackPrivateKey(
  process.env.BATCH_POSTER_PRIVATE_KEY
);
const batchPoster = privateKeyToAccount(batchPosterPrivateKey).address;

// load or generate a random validator account
const validatorPrivateKey = withFallbackPrivateKey(
  process.env.VALIDATOR_PRIVATE_KEY
);
const validator = privateKeyToAccount(validatorPrivateKey).address;

// set the parent chain and create a public client for it
const parentChain = arbitrumSepolia;
const publicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
}).extend(arbOwnerPublicActions);

// load the deployer account
const deployer = privateKeyToAccount(
  sanitizePrivateKey(process.env.DEPLOYER_PRIVATE_KEY)
);

async function main() {
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  }).extend(arbOwnerPublicActions);

  publicClient.arbOwnerPrepareTransactionRequest({
    functionName: 'setL1BaseFeeEstimateInertia',
    args: [BigInt(0)],
    account: deployer.address,
  });

  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: {
      InitialChainOwner: deployer.address,
      DataAvailabilityCommittee: true,
    },
  });

  // prepare the transaction for deploying the core contracts
  const request = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareConfig({
        chainId: BigInt(chainId),
        owner: deployer.address,
        chainConfig,
      }),
      batchPoster,
      validators: [validator],
      nativeToken: '0xf861378b543525ae0c47d33c90c954dc774ac1f9', // $ARB
    },
    account: deployer.address,
    publicClient: publicClient,
  });

  // sign and send the transaction
  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(request),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({ hash: txHash })
  );

  console.log(
    `Deployed in ${getBlockExplorerUrl(parentChain)}/tx/${
      txReceipt.transactionHash
    }`
  );
}

main();
