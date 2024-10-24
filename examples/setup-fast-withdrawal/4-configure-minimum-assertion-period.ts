import { createPublicClient, http, Address } from 'viem';
import {
  createRollupFetchTransactionHash,
  createRollupPrepareTransactionReceipt,
  rollupAdminLogicPublicActions,
} from '@arbitrum/orbit-sdk';
import { base, baseSepolia } from '@arbitrum/orbit-sdk/chains';
import { getParentChainFromId } from '@arbitrum/orbit-sdk/utils';
import { config } from 'dotenv';
import { propose } from './common.js';


config();

function getTimeDelayFromNumberOfBlocks(chainId: number, blocks: bigint): string {
  // For Arbitrum L2s built on top of Ethereum, or Arbitrum L3s built on top of an Arbitrum L2, `block.number` always returns the L1 block number.
  // L1 blocks are produced every 12 seconds.
  //
  // For Arbitrum L3s built on top of an OP Stack L2, `block.number` will return the L2 block number.
  // L2 blocks in OP Stack chains are produced every 2 seconds.
  const seconds = Number(
    chainId === base.id || chainId === baseSepolia.id ? blocks * 2n : blocks * 12n,
  );

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h${m}m${s}s`;
}


//check environment variables
if (typeof process.env.OWNER_1_ADDRESS_PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "OWNER_1_ADDRESS_PRIVATE_KEY" environment variable`);
}

if (typeof process.env.PARENT_CHAIN_ID === 'undefined') {
  throw new Error(`Please provide the "PARENT_CHAIN_ID" environment variable`);
}

if (typeof process.env.SAFE_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "SAFE_ADDRESS" environment variable`);
}

if (typeof process.env.ROLLUP_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_ADDRESS" environment variable`);
}

if (typeof process.env.RPC === 'undefined') {
  throw new Error(`Please provide an "RPC" endpoint with unlimited eth_getLogs range`);
}

if (typeof process.env.MINIMUM_ASSERTION_PERIOD === 'undefined') {
  console.log('MinimumAssertionPeriod set to 75')
}

if (typeof process.env.FC_VALIDATORS_SAFE_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "FC_VALIDATORS_SAFE_ADDRESS" environment variable (run step 1)`);
}

const minimumAssertionPeriod = BigInt(process.env.MINIMUM_ASSERTION_PERIOD || 75);
const rollupOwnerSafeAddress = process.env.SAFE_ADDRESS as `0x${string}`;
const rollupAddress = process.env.ROLLUP_ADDRESS as Address;
// // set the parent chain and create a public client for it
const parentChainId = Number(process.env.PARENT_CHAIN_ID);
const parentChain = getParentChainFromId(parentChainId);
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(process.env.RPC),
}).extend(
  rollupAdminLogicPublicActions({
    rollup: rollupAddress,
  }),
);

async function main() {
  //
  // Step 0. Gather necessary data (UpgradeExecutor address)
  //
  const transactionHash = await createRollupFetchTransactionHash({
    rollup: rollupAddress,
    publicClient: parentChainPublicClient,
  });
  const transactionReceipt = createRollupPrepareTransactionReceipt(
    await parentChainPublicClient.getTransactionReceipt({ hash: transactionHash }),
  );
  const coreContracts = transactionReceipt.getCoreContracts();
  const upgradeExecutorAddress = coreContracts.upgradeExecutor;

  console.log(
    `Step 4: Configure the minimumAssertionPeriod in the Rollup contract to: ${Number(
      minimumAssertionPeriod,
    )}`,
  );
  console.log('---');

  // get current minimumAssertionPeriod
  const currentMinimumAssertionPeriod = await parentChainPublicClient.rollupAdminLogicReadContract({
    functionName: 'minimumAssertionPeriod',
  });

  if (currentMinimumAssertionPeriod !== minimumAssertionPeriod) {
    // prepare setMinimumAssertionPeriod transaction request
    const setMinimumAssertionPeriodTransactionRequest =
      await parentChainPublicClient.rollupAdminLogicPrepareTransactionRequest({
        functionName: 'setMinimumAssertionPeriod',
        args: [minimumAssertionPeriod],
        upgradeExecutor: upgradeExecutorAddress,
        account: rollupOwnerSafeAddress,
      });
    propose(setMinimumAssertionPeriodTransactionRequest.to as string, setMinimumAssertionPeriodTransactionRequest.data as string, rollupOwnerSafeAddress);
    console.log('Transaction proposed');
  } else {
    console.log(
      `Minimum assertion period is already configured to ${currentMinimumAssertionPeriod}. Skipping.`,
    );
  }
  console.log('');

  //
  // Step 5. Show a confirmation message with the next steps
  //
  console.log(`Step 5: Configure your batch poster and your validator nodes`);
  console.log(`---`);
  console.log(
    'Your chain is now configured with a fast-withdrawal committee. The following instructions show how to configure your batch poster and your validators to start using this feature.',
  );
  console.log('');

  // Batch poster configuration
  const timeDelay = getTimeDelayFromNumberOfBlocks(parentChain.id, minimumAssertionPeriod);
  console.log('Your batch poster has to run at least nitro v3.1.1');
  console.log('Add the following parameter:');
  console.log(`--node.batch-poster.max-delay=${timeDelay}`);
  console.log('');

  // Validator configuration
  console.log('Your validators have to run at least nitro v3.1.1');
  console.log('Add the following parameters:');
  console.log(`--node.staker.enable-fast-confirmation=true`);
  console.log(`--node.staker.fast-confirm-safe-address=${process.env.FC_VALIDATORS_SAFE_ADDRESS}`);
  console.log(`--node.staker.make-assertion-interval=${timeDelay}`);
  console.log('');

  // Final recommendation
  console.log('Finally, restart your batch poster and validator nodes.');
}

main();
