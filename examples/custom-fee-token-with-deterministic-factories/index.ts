import { Chain, createPublicClient, http, Address } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { arbitrumGoerli } from 'viem/chains';
import {
  createRollupPrepareConfig,
  prepareChainConfig,
  createRollupEnoughCustomFeeTokenAllowance,
  createRollupPrepareCustomFeeTokenApprovalTransactionRequest,
  createRollupPrepareTransactionRequest,
  createRollupPrepareTransactionReceipt,
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
  throw new Error(`Please provide the "DEPLOYER_PRIVATE_KEY" environment variable`);
}

// load or generate a random batch poster account
const batchPosterPrivateKey = withFallbackPrivateKey(process.env.BATCH_POSTER_PRIVATE_KEY);
const batchPoster = privateKeyToAccount(batchPosterPrivateKey).address;

// load or generate a random validator account
const validatorPrivateKey = withFallbackPrivateKey(process.env.VALIDATOR_PRIVATE_KEY);
const validator = privateKeyToAccount(validatorPrivateKey).address;

// set the parent chain and create a public client for it
const parentChain = arbitrumGoerli;
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

// load the deployer account
const deployer = privateKeyToAccount(sanitizePrivateKey(process.env.DEPLOYER_PRIVATE_KEY));

async function main() {
  // generate a random chain id
  const chainId = generateChainId();
  // set the custom fee token
  const nativeToken: Address = '0xf861378b543525ae0c47d33c90c954dc774ac1f9';

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: {
      InitialChainOwner: deployer.address,
      DataAvailabilityCommittee: true,
    },
  });

  const allowanceParams = {
    nativeToken,
    account: deployer.address,
    publicClient: parentChainPublicClient,
  };

  if (!(await createRollupEnoughCustomFeeTokenAllowance(allowanceParams))) {
    const approvalTxRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest(
      allowanceParams
    );

    // sign and send the transaction
    const approvalTxHash = await parentChainPublicClient.sendRawTransaction({
      serializedTransaction: await deployer.signTransaction(approvalTxRequest),
    });

    // get the transaction receipt after waiting for the transaction to complete
    const approvalTxReceipt = createRollupPrepareTransactionReceipt(
      await parentChainPublicClient.waitForTransactionReceipt({
        hash: approvalTxHash,
      })
    );

    console.log(
      `Tokens approved in ${getBlockExplorerUrl(parentChain)}/tx/${
        approvalTxReceipt.transactionHash
      }`
    );
  }

  // prepare the transaction for deploying the core contracts
  const txRequest = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareConfig({
        chainId: BigInt(chainId),
        owner: deployer.address,
        chainConfig,
      }),
      batchPoster,
      validators: [validator],
      nativeToken,
      deployFactoriesToL2: true,
    },
    account: deployer.address,
    publicClient: parentChainPublicClient,
  });

  // sign and send the transaction
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createRollupPrepareTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash })
  );

  console.log(`Deployed in ${getBlockExplorerUrl(parentChain)}/tx/${txReceipt.transactionHash}`);
}

main();
