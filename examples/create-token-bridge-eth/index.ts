import { Chain, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import {
  createTokenBridgePrepareSetWethGatewayTransactionReceipt,
  createTokenBridgePrepareSetWethGatewayTransactionRequest,
  createTokenBridgePrepareTransactionReceipt,
  createTokenBridgePrepareTransactionRequest,
} from '@arbitrum/orbit-sdk';
import { config } from 'dotenv';
config();

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}

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

// define chain config for the child chain
const childChain = defineChain({
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
const childChainPublicClient = createPublicClient({ chain: childChain, transport: http() });

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
    childChainPublicClient,
    account: rollupOwner.address,
  });

  // sign and send the transaction
  const txHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await rollupOwner.signTransaction(txRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createTokenBridgePrepareTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({ hash: txHash }),
  );

  console.log(`Deployed in ${getBlockExplorerUrl(parentChain)}/tx/${txReceipt.transactionHash}`);

  // waiting for retryables to execute, to prevent race conditions
  await txReceipt.waitForRetryables({ orbitPublicClient: childChainPublicClient });

  // set weth gateway
  const setWethGatewayTxRequest = await createTokenBridgePrepareSetWethGatewayTransactionRequest({
    rollup: process.env.ROLLUP_ADDRESS as `0x${string}`,
    parentChainPublicClient,
    childChainPublicClient,
    account: rollupOwner.address,
    gasOverrides: {
      retryableTicketGasLimit: {
        percentIncrease: 200n,
      },
    },
  });

  // sign and send the transaction
  const setWethGatewayTxHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await rollupOwner.signTransaction(setWethGatewayTxRequest),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const setWethGatewayTxReceipt = createTokenBridgePrepareSetWethGatewayTransactionReceipt(
    await parentChainPublicClient.waitForTransactionReceipt({ hash: setWethGatewayTxHash }),
  );

  console.log(`Weth gateway set in ${getBlockExplorerUrl(parentChain)}/tx/${setWethGatewayTxReceipt.transactionHash}`);

  // Wait for retryables to execute
  await setWethGatewayTxReceipt.waitForRetryables({ orbitPublicClient: childChainPublicClient });
}

main();
