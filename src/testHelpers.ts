import { Address, sha256, toBytes } from 'viem';
import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { config } from 'dotenv';
import { execSync } from 'node:child_process';

import { sanitizePrivateKey } from './utils';

config();

type PrivateKeyAccountWithPrivateKey = PrivateKeyAccount & { privateKey: `0x${string}` };
// Source: https://github.com/OffchainLabs/nitro-testnode/blob/release/scripts/accounts.ts#L28
type NitroTestNodePrivateKeyAccounts = {
  sequencer: PrivateKeyAccountWithPrivateKey;
  // funnel
  deployer: PrivateKeyAccountWithPrivateKey;
  // sequencer (batch poster and rollup owner are the same in nitro-testnode)
  l2RollupOwner: PrivateKeyAccountWithPrivateKey;
  // l3owner
  l3RollupOwner: PrivateKeyAccountWithPrivateKey;
  // sha256(user_token_bridge_deployer)
  l3TokenBridgeDeployer: PrivateKeyAccountWithPrivateKey;
};

export function getNitroTestnodePrivateKeyAccounts(): NitroTestNodePrivateKeyAccounts {
  if (
    typeof process.env.NITRO_TESTNODE_DEPLOYER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_L2_ROLLUP_OWNER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_L3_ROLLUP_OWNER_PRIVATE_KEY === 'undefined' ||
    typeof process.env.NITRO_TESTNODE_SEQUENCER_PRIVATE_KEY === 'undefined'
  ) {
    throw Error(
      `required env variables: NITRO_TESTNODE_DEPLOYER_PRIVATE_KEY, NITRO_TESTNODE_L2_ROLLUP_OWNER_PRIVATE_KEY, NITRO_TESTNODE_L3_ROLLUP_OWNER_PRIVATE_KEY, NITRO_TESTNODE_SEQUENCER_PRIVATE_KEY`,
    );
  }

  const sequencerPrivateKey = sanitizePrivateKey(process.env.NITRO_TESTNODE_SEQUENCER_PRIVATE_KEY);
  const deployerPrivateKey = sanitizePrivateKey(process.env.NITRO_TESTNODE_DEPLOYER_PRIVATE_KEY);
  const l2RollupOwnerPrivateKey = sanitizePrivateKey(
    process.env.NITRO_TESTNODE_L2_ROLLUP_OWNER_PRIVATE_KEY,
  );
  const l3RollupOwnerPrivateKey = sanitizePrivateKey(
    process.env.NITRO_TESTNODE_L3_ROLLUP_OWNER_PRIVATE_KEY,
  );
  const l3TokenBridgeDeployerPrivateKey = sanitizePrivateKey(
    sha256(toBytes('user_token_bridge_deployer')),
  );

  return {
    sequencer: {
      ...privateKeyToAccount(sequencerPrivateKey),
      privateKey: sequencerPrivateKey,
    },
    deployer: { ...privateKeyToAccount(deployerPrivateKey), privateKey: deployerPrivateKey },
    l2RollupOwner: {
      ...privateKeyToAccount(l2RollupOwnerPrivateKey),
      privateKey: l2RollupOwnerPrivateKey,
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
  l3Rollup: Address;
  l3NativeToken: Address;
  sequencerInbox: Address;
  l3SequencerInbox: Address;
  l3Bridge: Address;
  batchPoster: Address;
  l3BatchPoster: Address;
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
        l3Bridge: l3DeploymentJson['bridge'],
        l3Rollup: l3DeploymentJson['rollup'],
        l3SequencerInbox: l3DeploymentJson['sequencer-inbox'],
        l3NativeToken: l3DeploymentJson['native-token'],
        l3BatchPoster: l3SequencerConfig.node['batch-poster']['parent-chain-wallet'].account,
      };
    } catch {
      // empty on purpose
    }
  }

  throw new Error('nitro-testnode sequencer not found');
}
