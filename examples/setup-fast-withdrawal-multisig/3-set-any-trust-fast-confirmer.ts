import { createPublicClient, http, Address, parseAbi } from 'viem';
import {
  createRollupFetchTransactionHash,
  createRollupPrepareTransactionReceipt,
  rollupAdminLogicPublicActions,
  setAnyTrustFastConfirmerPrepareTransactionRequest,
} from '@arbitrum/orbit-sdk';
import { getParentChainFromId } from '@arbitrum/orbit-sdk/utils';
import { config } from 'dotenv';
import { propose } from './common.js';


config();

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

if (typeof process.env.FC_VALIDATORS_SAFE_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "FC_VALIDATORS_SAFE_ADDRESS" environment variable (run step 1)`);
}

if (typeof process.env.ROLLUP_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_ADDRESS" environment variable`);
}

if (typeof process.env.RPC === 'undefined') {
  throw new Error(`Please provide an "RPC" endpoint with unlimited eth_getLogs range`);
}

const rollupOwnerSafeAddress = process.env.SAFE_ADDRESS as `0x${string}`;
const safeAddress = process.env.FC_VALIDATORS_SAFE_ADDRESS as `0x${string}`;
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
  const currentAnyTrustFastConfirmer = await parentChainPublicClient.readContract({
    address: rollupAddress,
    abi: parseAbi(['function anyTrustFastConfirmer() view returns (address)']),
    functionName: 'anyTrustFastConfirmer',
  });

  if (currentAnyTrustFastConfirmer.toLowerCase() !== safeAddress.toLowerCase()) {
    console.log('Gather necessary data (UpgradeExecutor address)');
    const transactionHash = await createRollupFetchTransactionHash({
      rollup: rollupAddress,
      publicClient: parentChainPublicClient,
    });
    const transactionReceipt = createRollupPrepareTransactionReceipt(
      await parentChainPublicClient.getTransactionReceipt({ hash: transactionHash }),
    );
    const coreContracts = transactionReceipt.getCoreContracts();
    const upgradeExecutorAddress = coreContracts.upgradeExecutor;
    const setAnyTrustFastConfirmerTransactionRequest =
      await setAnyTrustFastConfirmerPrepareTransactionRequest({
        publicClient: parentChainPublicClient,
        account: rollupOwnerSafeAddress,
        rollup: rollupAddress,
        upgradeExecutor: upgradeExecutorAddress,
        fastConfirmer: safeAddress,
      });
    propose(setAnyTrustFastConfirmerTransactionRequest.to as string, setAnyTrustFastConfirmerTransactionRequest.data as string, rollupOwnerSafeAddress);

  } else {
    console.log(
      `AnyTrust fast confirmer is already configured to ${currentAnyTrustFastConfirmer}. Skipping.`,
    );
  }
}

main();
