import { Chain, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import {
  createTokenBridgePrepareTransactionReceipt,
  createTokenBridgePrepareTransactionRequest,
} from '@arbitrum/orbit-sdk';
import { sanitizePrivateKey } from '@arbitrum/orbit-sdk/utils';
import { config } from 'dotenv';
config();

function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}

if (typeof process.env.ROLLUP_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_ADDRESS" environment variable`);
}

if (typeof process.env.ROLLUP_OWNER_PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_OWNER_PRIVATE_KEY" environment variable`);
}

if (typeof process.env.ORBIT_CHAIN_ID === 'undefined') {
  throw new Error(`Please provide the "ORBIT_CHAIN_ID" environment variable`);
}

if (typeof process.env.ORBIT_CHAIN_RPC === 'undefined') {
  throw new Error(`Please provide the "ORBIT_CHAIN_RPC" environment variable`);
}

// set the parent chain and create a public client for it
const parentChain = arbitrumSepolia;
const parentChainPublicClient = createPublicClient({ chain: parentChain, transport: http() });

// define chain config for the orbit chain
const orbitChain = defineChain({
  id: Number(process.env.ORBIT_CHAIN_ID),
  network: 'Orbit chain',
  name: 'orbit',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.ORBIT_CHAIN_RPC],
    },
    public: {
      http: [process.env.ORBIT_CHAIN_RPC],
    },
  },
  testnet: true,
});
const orbitChainPublicClient = createPublicClient({ chain: orbitChain, transport: http() });

// load the rollup owner account
const rollupOwner = privateKeyToAccount(sanitizePrivateKey(process.env.ROLLUP_OWNER_PRIVATE_KEY));

async function main() {
  // prepare the transaction for creating the token bridge
  const txRequest = await createTokenBridgePrepareTransactionRequest({
    params: {
      rollup: process.env.ROLLUP_ADDRESS as `0x${string}`,
      rollupOwner: rollupOwner.address,
    },
    parentChainPublicClient,
    orbitChainPublicClient,
    account: rollupOwner.address,
  });

  // sign and send the transaction
  console.log(`Deploying the TokenBridge...`);
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await rollupOwner.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
  );
  console.log(`Deployed in ${getBlockExplorerUrl(parentChain)}/tx/${txReceipt.transactionHash}`);

  // wait for retryables to execute
  console.log(`Waiting for retryable tickets to execute on the Orbit chain...`);
  const orbitChainRetryableReceipts = await txReceipt.waitForRetryables({
    orbitPublicClient: orbitChainPublicClient,
  });
  console.log(`Retryables executed`);
  console.log(
    `Transaction hash for first retryable is ${orbitChainRetryableReceipts[0].transactionHash}`,
  );
  console.log(
    `Transaction hash for second retryable is ${orbitChainRetryableReceipts[1].transactionHash}`,
  );

  // fetching the TokenBridge contracts
  const tokenBridgeContracts = await txReceipt.getTokenBridgeContracts({
    parentChainPublicClient,
  });
  console.log(`TokenBridge contracts:`, tokenBridgeContracts);
}

main();
