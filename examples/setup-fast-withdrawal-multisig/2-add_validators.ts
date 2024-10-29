import { createPublicClient, http, isAddress, Address } from 'viem';
import {
  createRollupFetchTransactionHash,
  createRollupPrepareTransactionReceipt,
  rollupAdminLogicPublicActions,
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

if (typeof process.env.FC_VALIDATORS === 'undefined') {
  throw new Error(`Please provide the "FC_VALIDATORS" environment variable`);
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
  console.log('Add the new Safe address (created in step 1) as a validator');
  fcValidators.push(safeAddress);

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

  //
  // Step 2. Add validators to the Orbit chain rollup validator whitelist
  //
  console.log(
    `Step 2: Adding the following validators to the Rollup validator whitelist:`,
    fcValidators,
  );
  console.log('---');

  // prepare set validator transaction request
  const fcValidatorsStatus = Array(fcValidators.length).fill(true);
  const setValidatorTransactionRequest =
    await parentChainPublicClient.rollupAdminLogicPrepareTransactionRequest({
      functionName: 'setValidator',
      args: [
        fcValidators, // validator address list
        fcValidatorsStatus, // validator status list
      ],
      upgradeExecutor: upgradeExecutorAddress,
      account: rollupOwnerSafeAddress,
    });
  propose(setValidatorTransactionRequest.to as string, setValidatorTransactionRequest.data as string, rollupOwnerSafeAddress);
}

main();
