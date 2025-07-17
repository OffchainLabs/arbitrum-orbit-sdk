import { writeFile } from 'fs/promises';
import { Chain, createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { sanitizePrivateKey } from '@arbitrum/orbit-sdk/utils';
import {
  ChainConfig,
  PrepareNodeConfigParams,
  OrbitSetupScriptConfigParams,
  createRollupPrepareTransaction,
  createRollupPrepareTransactionReceipt,
  prepareNodeConfig,
} from '@arbitrum/orbit-sdk';
import { getParentChainLayer } from '@arbitrum/orbit-sdk/utils';
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

if (typeof process.env.PARENT_CHAIN_RPC === 'undefined' || process.env.PARENT_CHAIN_RPC === '') {
  console.warn(
    `Warning: you may encounter timeout errors while running the script with the default rpc endpoint. Please provide the "PARENT_CHAIN_RPC" environment variable instead.`,
  );
}

// set the parent chain and create a public client for it
const parentChain = arbitrumSepolia;
const parentChainPublicClient = createPublicClient({
  chain: parentChain,
  transport: http(process.env.PARENT_CHAIN_RPC),
});

if (
  getParentChainLayer(parentChainPublicClient.chain.id) == 1 &&
  typeof process.env.ETHEREUM_BEACON_RPC_URL === 'undefined'
) {
  throw new Error(
    `Please provide the "ETHEREUM_BEACON_RPC_URL" environment variable necessary for L2 Orbit chains`,
  );
}

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

  const config = tx.getInputs()[0].config;
  // get the chain config from the transaction inputs
  const chainConfig: ChainConfig = JSON.parse(config.chainConfig);
  // get the core contracts from the transaction receipt
  const coreContracts = txReceipt.getCoreContracts();

  const chainName = process.env.CHAIN_NAME ?? 'My Orbit Chain';
  const parentChainRpc = process.env.PARENT_CHAIN_RPC ?? getRpcUrl(parentChain);

  // prepare the node config
  const nodeConfigParameters: PrepareNodeConfigParams = {
    chainName,
    chainConfig,
    coreContracts,
    batchPosterPrivateKey: process.env.BATCH_POSTER_PRIVATE_KEY as `0x${string}`,
    validatorPrivateKey: process.env.VALIDATOR_PRIVATE_KEY as `0x${string}`,
    stakeToken: config.stakeToken,
    parentChainId: parentChain.id,
    parentChainRpcUrl: parentChainRpc,
  };

  const orbitSetupScriptConfigParams: OrbitSetupScriptConfigParams = {
    networkFeeReceiver: chainConfig.arbitrum.InitialChainOwner,
    infrastructureFeeCollector: chainConfig.arbitrum.InitialChainOwner,
    staker: privateKeyToAccount(sanitizePrivateKey(process.env.VALIDATOR_PRIVATE_KEY!)).address,
    batchPoster: privateKeyToAccount(sanitizePrivateKey(process.env.BATCH_POSTER_PRIVATE_KEY!)).address,
    chainOwner: chainConfig.arbitrum.InitialChainOwner,
    chainId: chainConfig.chainId,
    chainName,
    minL2BaseFee: 100000000, // todo: check default?
    parentChainId: parentChain.id,
    'parent-chain-node-url': parentChainRpc,
    utils: coreContracts.validatorUtils, // todo: same as validatorUtils?
    rollup: coreContracts.rollup,
    inbox: coreContracts.inbox,
    nativeToken: coreContracts.nativeToken,
    outbox: coreContracts.outbox,
    rollupEventInbox: coreContracts.rollupEventInbox,
    challengeManager: coreContracts.challengeManager,
    adminProxy: coreContracts.adminProxy,
    sequencerInbox: coreContracts.sequencerInbox,
    bridge: coreContracts.bridge,
    upgradeExecutor: coreContracts.upgradeExecutor,
    validatorUtils: coreContracts.validatorUtils,
    validatorWalletCreator: coreContracts.validatorWalletCreator,
    deployedAtBlockNumber: coreContracts.deployedAtBlockNumber
  };

  // For L2 Orbit chains settling to Ethereum mainnet or testnet
  if (getParentChainLayer(parentChainPublicClient.chain.id) === 1) {
    nodeConfigParameters.parentChainBeaconRpcUrl = process.env.ETHEREUM_BEACON_RPC_URL;
  }

  const nodeConfig = prepareNodeConfig(nodeConfigParameters);

  await writeFile('nodeConfig.json', JSON.stringify(nodeConfig, null, 2));
  console.log(`Node config written to "node-config.json"`);

  await writeFile('orbitSetupScriptConfig.json', JSON.stringify(orbitSetupScriptConfigParams, null, 2));
  console.log(`Orbit setup script config written to "orbitSetupScriptConfig.json"`);

}

main();
