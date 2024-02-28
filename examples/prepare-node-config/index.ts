import { writeFile } from 'fs/promises';
import { Chain, createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import {
  ChainConfig,
  createRollupPrepareTransaction,
  createRollupPrepareTransactionReceipt,
  prepareNodeConfig,
} from '@arbitrum/orbit-sdk';
import { config } from 'dotenv';
config();

function getRpcUrl(chain: Chain) {
  return chain.rpcUrls.default.http[0];
}

if (typeof process.env.ORBIT_DEPLOYMENT_TRANSACTION_HASH === 'undefined') {
  throw new Error(`Please provide the "ORBIT_DEPLOYMENT_TRANSACTION_HASH" environment variable`);
}

if (typeof process.env.BATCH_POSTER_PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "BATCH_POSTER_PRIVATE_KEY" environment variable`);
}

if (typeof process.env.VALIDATOR_PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "VALIDATOR_PRIVATE_KEY" environment variable`);
}

// set the parent chain and create a public client for it
const parentChain = arbitrumSepolia;
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(),
});

async function main() {
  // tx hash for the transaction to create rollup
  const txHash = process.env.ORBIT_DEPLOYMENT_TRANSACTION_HASH as `0x${string}`;

  // get the transaction
  const tx = createRollupPrepareTransaction(
    await parentChainPublicClient.getTransaction({ hash: txHash }),
  );

  // get the transaction receipt
  const txReceipt = createRollupPrepareTransactionReceipt(
    await parentChainPublicClient.getTransactionReceipt({ hash: txHash }),
  );

  // get the chain config from the transaction inputs
  const chainConfig: ChainConfig = JSON.parse(tx.getInputs()[0].config.chainConfig);
  // get the core contracts from the transaction receipt
  const coreContracts = txReceipt.getCoreContracts();

  // prepare the node config
  const nodeConfig = prepareNodeConfig({
    chainName: 'My Orbit Chain',
    chainConfig,
    coreContracts,
    batchPosterPrivateKey: process.env.BATCH_POSTER_PRIVATE_KEY as `0x${string}`,
    validatorPrivateKey: process.env.VALIDATOR_PRIVATE_KEY as `0x${string}`,
    parentChainId: parentChain.id,
    parentChainRpcUrl: getRpcUrl(parentChain),
  });

  await writeFile('node-config.json', JSON.stringify(nodeConfig, null, 2));
  console.log(`Node config written to "node-config.json"`);
}

main();
