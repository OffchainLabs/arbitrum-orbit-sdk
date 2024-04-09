import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { Ownable__factory } from '@arbitrum/sdk/dist/lib/abi/factories/Ownable__factory';
import { OrbitHandler } from '../lib/client';
import { Abi, AbiEventItem, RollupInformationFromRollupCreatedEvent } from '../lib/types';
import {
  UpgradeExecutorRoles,
  contractIsERC20,
  getBlockToSearchEventsFrom,
  getCurrentAdminOfContract,
  getCurrentKeysetsForDAS,
  getRollupInformationFromRollupCreator,
  getUpgradeExecutorPrivilegedAccounts,
} from '../lib/utils';
import { zeroAddress } from 'viem';
import { SequencerInbox__factory } from '@arbitrum/sdk/dist/lib/abi/factories/SequencerInbox__factory';
import { WASMModuleRoots } from '../lib/constants';

// Constants
const minConfirmPeriodBlocks = 45818;

export const rollupHandler = async (
  orbitHandler: OrbitHandler,
  rollupAddress: `0x${string}`,
): Promise<string[]> => {
  //
  // Initialization
  //
  const warningMessages: string[] = [];

  //
  // Get RollupCreated log
  //
  console.log('Information from RollupCreated event');
  console.log('--------------');
  let rollupCreatorAddress = '';
  let proxyAdminAddress = '';
  let upgradeExecutorAddress = '';
  let nativeTokenAddress = '';
  let isAnyTrust = false;
  try {
    const rollupInformation = (await getRollupInformationFromRollupCreator(
      orbitHandler,
      'parent',
      rollupAddress,
    )) as RollupInformationFromRollupCreatedEvent;
    rollupCreatorAddress = rollupInformation.rollupCreatorAddress;
    console.log(`Rollup created with RollupCreator at ${rollupCreatorAddress}`);

    if (
      !rollupInformation.rollupAddresses ||
      Object.keys(rollupInformation.rollupAddresses).length <= 0
    ) {
      warningMessages.push(
        `RollupCreated event could not be parsed for RollupCreator ${rollupCreatorAddress}`,
      );
      warningMessages.push(`There won't be ProxyAdmin or UpgradeExecutor verifications`);
      console.log(`RollupCreated event could not be parsed. Continuing...`);
    } else {
      console.log(`Addresses on RollupCreated event:`, rollupInformation.rollupAddresses);

      // Getting ProxyAdmin and UpgradeExecutor if present
      if (rollupInformation.rollupAddresses.adminProxy) {
        proxyAdminAddress = rollupInformation.rollupAddresses.adminProxy;
      } else {
        warningMessages.push(
          `ProxyAdmin address not found. There won't be ProxyAdmin verifications`,
        );
      }
      if (rollupInformation.rollupAddresses.upgradeExecutor) {
        upgradeExecutorAddress = rollupInformation.rollupAddresses.upgradeExecutor;
      } else {
        warningMessages.push(
          `UpgradeExecutor address not found. There won't be UpgradeExecutor verifications`,
        );
      }

      // Getting nativeToken if present
      if (rollupInformation.rollupAddresses.nativeToken) {
        nativeTokenAddress = rollupInformation.rollupAddresses.nativeToken;
      }
    }

    if (
      !rollupInformation.rollupParameters ||
      Object.keys(rollupInformation.rollupParameters).length <= 0
    ) {
      warningMessages.push(
        `createRollup input could not be parsed for RollupCreator ${rollupCreatorAddress}`,
      );
    } else {
      console.log(`Input of createRollup:`, rollupInformation.rollupParameters);

      if (rollupInformation.rollupChainConfig!.arbitrum.DataAvailabilityCommittee) {
        isAnyTrust = true;
      }
    }
  } catch (err) {
    warningMessages.push(
      `RollupCreated event could not be found for RollupCreator ${rollupCreatorAddress}. Error: ${err}`,
    );
    warningMessages.push(`There won't be ProxyAdmin or UpgradeExecutor verifications`);
    console.log(`Error while finding the RollupCreated event: ${err}`);
  }
  console.log('');

  //
  // Get rollup information
  //
  console.log('Rollup contract addresses');
  console.log('--------------');
  const [bridgeAddress, inboxAddress, sequencerInboxAddress, outboxAddress, rollupOwner] =
    await Promise.all(
      ['bridge', 'inbox', 'sequencerInbox', 'outbox', 'owner'].map(async (functionName) => {
        const address = (await orbitHandler.readContract(
          'parent',
          rollupAddress,
          [...RollupCore__factory.abi, ...Ownable__factory.abi] as Abi,
          functionName,
        )) as `0x${string}`;
        return address;
      }),
    );

  console.log(`Rollup: ${rollupAddress}`);
  console.log(`Bridge: ${bridgeAddress}`);
  console.log(`Inbox: ${inboxAddress}`);
  console.log(`SequencerInbox: ${sequencerInboxAddress}`);
  console.log(`Outbox: ${outboxAddress}`);
  console.log('');

  //
  // Get contract owners/admins
  //
  console.log('Rollup contracts owners/admins');
  console.log('--------------');
  const [rollupAdmin, bridgeAdmin, inboxAdmin, sequencerInboxAdmin, outboxAdmin] =
    await Promise.all(
      [rollupAddress, bridgeAddress, inboxAddress, sequencerInboxAddress, outboxAddress].map(
        async (contractAddress) => {
          const address = (await getCurrentAdminOfContract(
            orbitHandler,
            'parent',
            contractAddress,
          )) as `0x${string}`;
          return address;
        },
      ),
    );

  console.log(
    `Rollup owner: ${rollupOwner}${
      upgradeExecutorAddress
        ? ' (' +
          (upgradeExecutorAddress == rollupOwner
            ? 'Is UpgradeExecutor'
            : 'Is NOT UpgradeExecutor') +
          ')'
        : ''
    }`,
  );
  console.log(
    `Rollup admin: ${rollupAdmin}${
      upgradeExecutorAddress
        ? ' (' +
          (upgradeExecutorAddress == rollupAdmin
            ? 'Is UpgradeExecutor'
            : 'Is NOT UpgradeExecutor') +
          ')'
        : ''
    }`,
  );
  console.log(
    `Bridge admin: ${bridgeAdmin}${
      proxyAdminAddress
        ? ' (' + (proxyAdminAddress == bridgeAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') + ')'
        : ''
    }`,
  );
  console.log(
    `Inbox admin: ${inboxAdmin}${
      proxyAdminAddress
        ? ' (' + (proxyAdminAddress == inboxAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') + ')'
        : ''
    }`,
  );
  console.log(
    `SequencerInbox admin: ${sequencerInboxAdmin}${
      proxyAdminAddress
        ? ' (' +
          (proxyAdminAddress == sequencerInboxAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') +
          ')'
        : ''
    }`,
  );
  console.log(
    `Outbox admin: ${outboxAdmin}${
      proxyAdminAddress
        ? ' (' + (proxyAdminAddress == outboxAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin') + ')'
        : ''
    }`,
  );
  console.log('');

  //
  // ProxyAdmin verification
  //
  if (proxyAdminAddress) {
    //
    // Rollup contracts verifications
    //
    if (bridgeAdmin != proxyAdminAddress) {
      warningMessages.push(`Bridge admin is not the ProxyAdmin`);
    }
    if (inboxAdmin != proxyAdminAddress) {
      warningMessages.push(`Inbox admin is not the ProxyAdmin`);
    }
    if (sequencerInboxAdmin != proxyAdminAddress) {
      warningMessages.push(`SequencerInbox admin is not the ProxyAdmin`);
    }
    if (outboxAdmin != proxyAdminAddress) {
      warningMessages.push(`Outbox admin is not the ProxyAdmin`);
    }

    //
    // ProxyAdmin owner
    //
    console.log('ProxyAdmin owner');
    console.log('--------------');
    const proxyAdminOwner = (await orbitHandler.readContract(
      'parent',
      proxyAdminAddress as `0x${string}`,
      Ownable__factory.abi as Abi,
      'owner',
    )) as `0x${string}`;
    console.log(
      `ProxyAdmin owner: ${proxyAdminOwner}${
        upgradeExecutorAddress
          ? ' (' +
            (upgradeExecutorAddress == proxyAdminOwner
              ? 'Is UpgradeExecutor'
              : 'Is NOT UpgradeExecutor') +
            ')'
          : ''
      }`,
    );

    if (upgradeExecutorAddress && proxyAdminOwner != upgradeExecutorAddress) {
      warningMessages.push(`ProxyAdmin owner is not the UpgradeExecutor`);
    }
  } else {
    console.log(
      `ProxyAdmin verification was skipped because it was not found in the RollupCreated event.`,
    );
  }
  console.log('');

  //
  // UpgradeExecutor verification
  //
  if (upgradeExecutorAddress) {
    //
    // Rollup contracts verifications
    //
    if (rollupOwner != upgradeExecutorAddress) {
      warningMessages.push(`Rollup owner is not the UpgradeExecutor`);
    }
    if (rollupAdmin != upgradeExecutorAddress) {
      warningMessages.push(`Rollup admin is not the UpgradeExecutor`);
    }

    //
    // UpgradeExecutor privileged accounts
    //
    console.log('UpgradeExecutor privileged accounts');
    console.log('--------------');
    const upgradeExecutorPrivilegedAccounts = await getUpgradeExecutorPrivilegedAccounts(
      orbitHandler,
      'parent',
      upgradeExecutorAddress as `0x${string}`,
    );
    if (!upgradeExecutorPrivilegedAccounts) {
      console.log(`No privileged accounts found in the UpgradeExecutor contract`);
    } else {
      Object.keys(upgradeExecutorPrivilegedAccounts).forEach((privilegedAccount) => {
        const accountRoles = upgradeExecutorPrivilegedAccounts[
          privilegedAccount as `0x${string}`
        ].map((role) => {
          if (role in UpgradeExecutorRoles) {
            return UpgradeExecutorRoles[role];
          } else {
            return role;
          }
        });

        console.log(`${privilegedAccount}: ${accountRoles.join(',')}`);
      });
    }
  } else {
    console.log(
      `UpgradeExecutor verification was skipped because it was not found in the RollupCreated event.`,
    );
  }
  console.log('');

  //
  // Native token
  //
  console.log('Native token verification');
  console.log('--------------');
  if (!nativeTokenAddress || nativeTokenAddress == zeroAddress) {
    console.log(`Native token is ETH`);
  } else {
    const nativeTokenIsERC20 = await contractIsERC20(
      orbitHandler,
      'parent',
      nativeTokenAddress as `0x${string}`,
    );
    if (nativeTokenIsERC20) {
      console.log(`Native token ${nativeTokenAddress} is a contract`);
    } else {
      console.log(`Native token ${nativeTokenAddress} is NOT a contract`);
      warningMessages.push(`Native token ${nativeTokenAddress} is NOT a contract`);
    }
  }
  console.log('');

  //
  // Stake token
  //
  console.log('Stake token verification');
  console.log('--------------');
  const stakeTokenAddress = (await orbitHandler.readContract(
    'parent',
    rollupAddress,
    RollupCore__factory.abi as Abi,
    'stakeToken',
  )) as `0x${string}`;
  if (stakeTokenAddress == zeroAddress) {
    console.log(`Stake token is ETH`);
  } else {
    const stakeTokenIsERC20 = await contractIsERC20(
      orbitHandler,
      'parent',
      stakeTokenAddress as `0x${string}`,
    );
    if (stakeTokenIsERC20) {
      console.log(`Stake token ${stakeTokenAddress} is a contract`);
    } else {
      console.log(`Stake token ${stakeTokenAddress} is NOT a contract`);
      warningMessages.push(`Stake token ${stakeTokenAddress} is NOT a contract`);
    }
  }
  console.log('');

  //
  // DAS verification
  //
  if (isAnyTrust) {
    console.log('AnyTrust verification');
    console.log('--------------');
    console.log(`Chain was configured as AnyTrust`);
    const validKeysets = await getCurrentKeysetsForDAS(
      orbitHandler,
      'parent',
      sequencerInboxAddress,
    );

    if (!validKeysets || validKeysets.length == 0) {
      console.log(
        `Chain is configured as AnyTrust, but no valid Keyset was found on the SequencerInbox`,
      );
      warningMessages.push(
        `Chain is configured as AnyTrust, but no valid Keyset was found on the SequencerInbox`,
      );
    } else {
      console.log(`Valid keysets:`, validKeysets);

      if (validKeysets.length > 1) {
        console.log(`Multiple valid keysets were found in the SequencerInbox`);
        warningMessages.push(`Multiple valid keysets were found in the SequencerInbox`);
      }

      if (
        validKeysets.includes('0x4d795e20d33eea0b070600e4e100c512a750562bf03c300c99444bd5af92d9b0')
      ) {
        console.log(`Found valid keyset for private key = zero address`);
        warningMessages.push(`Found valid keyset for private key = zero address`);
      }
    }
    console.log('');
  }

  //
  // SequencerInbox activity
  //
  console.log('SequencerInbox activity');
  console.log('--------------');
  const currentBlock = await orbitHandler.getBlockNumber('parent');
  const fromBlock = getBlockToSearchEventsFrom(await orbitHandler.getParentChainId(), currentBlock);
  const sequencerBatchDeliveredEventLogs = await orbitHandler.getLogs(
    'parent',
    sequencerInboxAddress,
    SequencerInbox__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'SequencerBatchDelivered',
    )[0] as AbiEventItem,
    undefined,
    fromBlock,
    'latest',
  );
  const sequencerInboxIsActive = sequencerBatchDeliveredEventLogs.length > 0;
  if (sequencerInboxIsActive) {
    console.log(`SequencerInbox has received batches recently`);
  } else {
    console.log(
      `SequencerInbox ${sequencerInboxAddress} does not seem to be active (no batches posted recently)`,
    );
    warningMessages.push(
      `SequencerInbox ${sequencerInboxAddress} does not seem to be active (no batches posted recently)`,
    );
  }
  console.log('');

  //
  // Rollup activity
  //
  console.log('Rollup activity');
  console.log('--------------');
  const nodeCreatedEventLogs = await orbitHandler.getLogs(
    'parent',
    rollupAddress,
    RollupCore__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'NodeCreated',
    )[0] as AbiEventItem,
    undefined,
    fromBlock,
    'latest',
  );
  const rollupIsActive = nodeCreatedEventLogs.length > 0;
  if (rollupIsActive) {
    console.log(`Rollup has created nodes recently`);
  } else {
    console.log(`Rollup ${rollupAddress} does not seem to be active (no nodes created recently)`);
    warningMessages.push(
      `Rollup ${rollupAddress} does not seem to be active (no nodes created recently)`,
    );
  }
  console.log('');

  //
  // Rollup configuration
  //
  console.log('Rollup configuration');
  console.log('--------------');
  const confirmPeriodBlocks = (await orbitHandler.readContract(
    'parent',
    rollupAddress,
    RollupCore__factory.abi as Abi,
    'confirmPeriodBlocks',
  )) as bigint;
  console.log(`Challenge period blocks: ${confirmPeriodBlocks}`);
  if (confirmPeriodBlocks < minConfirmPeriodBlocks) {
    console.log(
      `Challenge period blocks ${confirmPeriodBlocks} is lower than the minimum ${minConfirmPeriodBlocks}`,
    );
    warningMessages.push(
      `Challenge period blocks ${confirmPeriodBlocks} is lower than the minimum ${minConfirmPeriodBlocks}`,
    );
  }
  console.log('');

  //
  // STF verification
  //
  console.log('State transition function (WASM module root)');
  console.log('--------------');
  // get the wasmModuleRoot of the given orbit chain
  const moduleRoot = (await orbitHandler.readContract(
    'parent',
    rollupAddress,
    [...RollupCore__factory.abi, ...Ownable__factory.abi] as Abi,
    'wasmModuleRoot',
  )) as `0x${string}`;

  const index = WASMModuleRoots.indexOf(moduleRoot);
  const latestWasmModuleRootIndex = WASMModuleRoots.length - 1;

  // check if this wasmModuleRoot belongs to one of mainnet version
  if (0 <= index) {
    console.log(`WASM module root recognized: ${moduleRoot}`);
    // check if the rollups' arbos version is latest or not
    /* if (index < latestWasmModuleRootIndex) {
      warningMessages.push(
        `Arbos version is old, Rollup wasmModuleRoot is ${moduleRoot}. Latest standard wasmModuleRoot is ${WASMModuleRoots[latestWasmModuleRootIndex]}.`,
      );
    } */
  } else {
    console.log('WASM module root not recognized');
    warningMessages.push(
      `The node is using a customized state transition function, the WASM module root is ${moduleRoot}`,
    );
  }
  console.log('');

  return warningMessages;
};
