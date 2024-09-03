import { createPublicClient, http, isAddress } from 'viem';
import {
  createSafePrepareTransactionRequest,
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

if (typeof process.env.FC_VALIDATORS === 'undefined') {
  throw new Error(`Please provide the "FC_VALIDATORS" environment variable`);
}

const rollupOwnerSafeAddress = process.env.SAFE_ADDRESS as `0x${string}`;
// // set the parent chain and create a public client for it
const parentChainId = Number(process.env.PARENT_CHAIN_ID);
const parentChain = getParentChainFromId(parentChainId);
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(process.env.RPC),
});
// sanitize validator addresses
const fcValidators = JSON.parse(process.env.FC_VALIDATORS);
const safeWalletThreshold = fcValidators.length;
if (!fcValidators) {
  throw new Error(`The "FC_VALIDATORS" environment variable must be a valid array`);
}

const sanitizedFcValidators = [
  ...new Set(
    fcValidators.filter((validator: `0x${string}`) =>
      isAddress(validator) ? validator : undefined,
    ),
  ),
];
if (sanitizedFcValidators.length !== safeWalletThreshold) {
  throw new Error(
    `Some of the addresses in the "FC_VALIDATORS" environment variable appear to not be valid or duplicated.`,
  );
}

async function main() {
  //
  // Step 1. Create Safe multisig
  //
  console.log(
    `Step 1: Create a new ${safeWalletThreshold}/${safeWalletThreshold} Safe wallet with the following addresses as signers:`,
    fcValidators,
  );
  console.log('---');
  const txRequest = await createSafePrepareTransactionRequest({
    publicClient: parentChainPublicClient,
    account: rollupOwnerSafeAddress,
    owners: fcValidators,
    threshold: safeWalletThreshold,
    saltNonce: BigInt(Date.now())
  });
  propose(txRequest.to as string, txRequest.data as string, rollupOwnerSafeAddress);
  //execute the transaction
  //https://help.safe.global/en/articles/40834-verify-safe-creation
  //in the executed transaction find `ProxyCreation` event
  //Data singleton : <address> is what you're looing for
}

main();
