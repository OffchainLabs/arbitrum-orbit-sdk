import { Address, PublicClient, defineChain, zeroAddress } from 'viem';
import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { config } from 'dotenv';
import { execSync } from 'node:child_process';

import { generateChainId, sanitizePrivateKey } from './utils';
import { createRollup } from './createRollup';
import { createRollupPrepareDeploymentParamsConfig } from './createRollupPrepareDeploymentParamsConfig';
import { prepareChainConfig } from './prepareChainConfig';

config();

type PrivateKeyAccountWithPrivateKey = PrivateKeyAccount & { privateKey: `0x${string}` };
// Source: https://github.com/OffchainLabs/nitro-testnode/blob/release/scripts/accounts.ts#L28
type NitroTestNodePrivateKeyAccounts = {
  // funnel
  deployer: PrivateKeyAccountWithPrivateKey;
  // sequencer (batch poster and rollup owner are the same in nitro-testnode)
  l2RollupOwner: PrivateKeyAccountWithPrivateKey;
  // l3owner
  l3RollupOwner: PrivateKeyAccountWithPrivateKey;
  // sha256(user_token_bridge_deployer)
  l3TokenBridgeDeployer: PrivateKeyAccountWithPrivateKey;
  // l2 token bridge deployer
  l2TokenBridgeDeployer: PrivateKeyAccountWithPrivateKey;
  // l3 token bridge deployer which holds custom gas token
};

export function getNitroTestnodePrivateKeyAccounts(): NitroTestNodePrivateKeyAccounts {
  if (
    typeof process.env.NITRO_TESTNODE_DEPLOYER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_L2_ROLLUP_OWNER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_L3_ROLLUP_OWNER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_L2_TOKEN_BRIDGE_DEPLOYER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_L3_TOKEN_BRIDGE_DEPLOYER_PRIVATE_KEY === 'undefined'
  ) {
    throw Error(
      `required env variables: NITRO_TESTNODE_DEPLOYER_PRIVATE_KEY, NITRO_TESTNODE_L2_ROLLUP_OWNER_PRIVATE_KEY,
      NITRO_TESTNODE_L2_TOKEN_BRIDGE_DEPLOYER_PRIVATE_KEY, NITRO_TESTNODE_L3_ROLLUP_OWNER_PRIVATE_KEY,
      NITRO_TESTNODE_L3_TOKEN_BRIDGE_DEPLOYER_PRIVATE_KEY`,
    );
  }

  const deployerPrivateKey = sanitizePrivateKey(process.env.NITRO_TESTNODE_DEPLOYER_PRIVATE_KEY);
  const l2RollupOwnerPrivateKey = sanitizePrivateKey(
    process.env.NITRO_TESTNODE_L2_ROLLUP_OWNER_PRIVATE_KEY,
  );
  const l2TokenBridgeDeployerPrivateKey = sanitizePrivateKey(
    process.env.NITRO_TESTNODE_L2_TOKEN_BRIDGE_DEPLOYER_PRIVATE_KEY,
  );
  const l3RollupOwnerPrivateKey = sanitizePrivateKey(
    process.env.NITRO_TESTNODE_L3_ROLLUP_OWNER_PRIVATE_KEY,
  );
  const l3TokenBridgeDeployerPrivateKey = sanitizePrivateKey(
    process.env.NITRO_TESTNODE_L3_TOKEN_BRIDGE_DEPLOYER_PRIVATE_KEY,
  );

  return {
    deployer: { ...privateKeyToAccount(deployerPrivateKey), privateKey: deployerPrivateKey },
    l2RollupOwner: {
      ...privateKeyToAccount(l2RollupOwnerPrivateKey),
      privateKey: l2RollupOwnerPrivateKey,
    },
    l2TokenBridgeDeployer: {
      ...privateKeyToAccount(l2TokenBridgeDeployerPrivateKey),
      privateKey: l2TokenBridgeDeployerPrivateKey,
    },
    l3RollupOwner: {
      ...privateKeyToAccount(l3RollupOwnerPrivateKey),
      privateKey: l3RollupOwnerPrivateKey,
    },
    l3TokenBridgeDeployer: {
      ...privateKeyToAccount(l3TokenBridgeDeployerPrivateKey),
      privateKey: l3TokenBridgeDeployerPrivateKey,
    },
  };
}

type TestnodeInformation = {
  bridge: Address;
  rollup: Address;
  sequencerInbox: Address;
  l3SequencerInbox: Address;
  upgradeExecutor: Address;
  l3Bridge: Address;
  batchPoster: Address;
  l3BatchPoster: Address;
  l3UpgradeExecutor: Address;
  l3Rollup: `0x${string}`;
  l3NativeToken: `0x${string}`;
};

export function getInformationFromTestnode(): TestnodeInformation {
  const containers = [
    'nitro_sequencer_1',
    'nitro-sequencer-1',
    'nitro-testnode-sequencer-1',
    'nitro-testnode_sequencer_1',
  ];

  for (const container of containers) {
    try {
      const deploymentJson = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/deployment.json').toString(),
      );

      const l3DeploymentJson = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/l3deployment.json').toString(),
      );

      const sequencerConfig = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/sequencer_config.json').toString(),
      );

      const l3SequencerConfig = JSON.parse(
        execSync('docker exec ' + container + ' cat /config/l3node_config.json').toString(),
      );

      return {
        bridge: deploymentJson['bridge'],
        rollup: deploymentJson['rollup'],
        sequencerInbox: deploymentJson['sequencer-inbox'],
        batchPoster: sequencerConfig.node['batch-poster']['parent-chain-wallet'].account,
        upgradeExecutor: deploymentJson['upgrade-executor'],
        l3Bridge: l3DeploymentJson['bridge'],
        l3Rollup: l3DeploymentJson['rollup'],
        l3SequencerInbox: l3DeploymentJson['sequencer-inbox'],
        l3NativeToken: l3DeploymentJson['native-token'],
        l3BatchPoster: l3SequencerConfig.node['batch-poster']['parent-chain-wallet'].account,
        l3UpgradeExecutor: l3DeploymentJson['upgrade-executor'],
      };
    } catch {
      // empty on purpose
    }
  }

  throw new Error('nitro-testnode sequencer not found');
}

export async function createRollupHelper({
  deployer,
  batchPoster,
  validators,
  nativeToken = zeroAddress,
  client,
}: {
  deployer: PrivateKeyAccountWithPrivateKey;
  batchPoster: Address;
  validators: [Address];
  nativeToken: Address;
  client: PublicClient;
}) {
  const chainId = generateChainId();

  const createRollupConfig = createRollupPrepareDeploymentParamsConfig(client, {
    chainId: BigInt(chainId),
    owner: deployer.address,
    chainConfig: prepareChainConfig({
      chainId,
      arbitrum: {
        InitialChainOwner: deployer.address,
        DataAvailabilityCommittee: true,
      },
    }),
  });

  const createRollupInformation = await createRollup({
    params: {
      config: createRollupConfig,
      batchPoster,
      validators,
      nativeToken,
    },
    account: deployer,
    parentChainPublicClient: client,
  });

  // create test rollup with ETH as gas token
  return {
    createRollupConfig,
    createRollupInformation,
  };
}

export const xai = defineChain({
  id: 660279,
  network: 'Xai Mainnet',
  name: 'Xai Mainnet',
  nativeCurrency: { name: 'Xai', symbol: 'XAI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://xai-chain.net/rpc'],
    },
    public: {
      http: ['https://xai-chain.net/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.xai-chain.net',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 222549,
    },
  },
  testnet: false,
});
