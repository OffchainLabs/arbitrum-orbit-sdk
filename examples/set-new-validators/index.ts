import { Chain, createPublicClient, http, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import {
  createRollupFetchTransactionHash,
  createRollupPrepareTransactionReceipt,
  rollupAdminLogicPublicActions,
} from '@arbitrum/orbit-sdk';
import { sanitizePrivateKey } from '@arbitrum/orbit-sdk/utils';
import { config } from 'dotenv';
config();

if (typeof process.env.ROLLUP_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_ADDRESS" environment variable`);
}

if (typeof process.env.ROLLUP_OWNER_PRIVATE_KEY === 'undefined') {
  throw new Error(`Please provide the "ROLLUP_OWNER_PRIVATE_KEY" environment variable`);
}

if (typeof process.env.NEW_VALIDATOR_ADDRESS === 'undefined') {
  throw new Error(`Please provide the "NEW_VALIDATOR_ADDRESS" environment variable`);
}

function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}

// set the parent chain and create a public client for it
const parentChain = arbitrumSepolia;
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(process.env.PARENT_CHAIN_RPC),
}).extend(
  rollupAdminLogicPublicActions({
    rollup: process.env.ROLLUP_ADDRESS as Address,
  }),
);

// load the deployer account
const deployer = privateKeyToAccount(sanitizePrivateKey(process.env.ROLLUP_OWNER_PRIVATE_KEY));

async function main() {
  //
  // Parent chain
  // ------------
  //
  // get the core contracts
  console.log('Fetching UpgradeExecutor address in the parent chain...');
  const transactionHash = await createRollupFetchTransactionHash({
    rollup: process.env.ROLLUP_ADDRESS as Address,
    publicClient: parentChainPublicClient,
  });
  const transactionReceipt = createRollupPrepareTransactionReceipt(
    await parentChainPublicClient.getTransactionReceipt({ hash: transactionHash }),
  );
  const coreContracts = transactionReceipt.getCoreContracts();
  console.log(`UpgradeExecutor address: ${coreContracts.upgradeExecutor}`);

  // here we just set one new validator, so the array length is 1
  const newValidators = [process.env.NEW_VALIDATOR_ADDRESS as Address];
  const newValidatorStatus = [true];

  // check the status of this address in validator list before executing
  const beforeStatus = await parentChainPublicClient.rollupAdminLogicReadContract({
    functionName: 'isValidator',
    args: [newValidators[0]]
  });
  console.log(
    `Before executing, the address ${newValidators[0]} status in validator list is ${beforeStatus}`,
  );

  // prepare set validator transaction request
  const setValidatorTransactionRequest =
    await parentChainPublicClient.rollupAdminLogicPrepareTransactionRequest({
      functionName: 'setValidator',
      args: [
        newValidators, // validator address list
        newValidatorStatus, // validator status list
      ],
      upgradeExecutor: coreContracts.upgradeExecutor,
      account: deployer.address
    });

  // sign and send the transaction
  const setValidatorTransactionHash = await parentChainPublicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(setValidatorTransactionRequest),
  });

  // wait for transaction receipt
  const setValidatorTransactionReceipt = await parentChainPublicClient.waitForTransactionReceipt({
    hash: setValidatorTransactionHash,
  });

  console.log(
    `New validator address set in ${getBlockExplorerUrl(parentChain)}/tx/${
      setValidatorTransactionReceipt.transactionHash
    }`,
  );

  // Check the status of this address in validator list before executing
  const afterStatus = await parentChainPublicClient.rollupAdminLogicReadContract({
    functionName: 'isValidator',
    args: [newValidators[0]],
    rollup: coreContracts.rollup,
  });

  console.log(
    `After executing, the address ${newValidators[0]} status in validator list is ${afterStatus}`,
  );
}

main();
