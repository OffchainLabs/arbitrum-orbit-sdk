import { Address, PublicClient } from 'viem';
import { AbiEvent } from 'abitype';

/**
 * This type is for the params of the upgradeExecutorFetchPrivilegedAccounts function
 */
export type UpgradeExecutorFetchPrivilegedAccountsParams = {
  upgradeExecutorAddress: Address;
  publicClient: PublicClient;
};

/**
 * This type is for the result of the upgradeExecutorFetchPrivilegedAccounts function.
 *
 * It is an object containing the addresses of the privileged accounts as keys,
 * and an array with a hash for each role they have.
 */
export type UpgradeExecutorPrivilegedAccounts = {
  // Key: account
  // Value: array of roles
  [key: `0x${string}`]: `0x${string}`[];
};

type RoleGrantedLogArgs = {
  role: `0x${string}`;
  account: `0x${string}`;
  sender: `0x${string}`;
};
type RoleRevokedLogArgs = RoleGrantedLogArgs;

const RoleGrantedEventAbi: AbiEvent = {
  inputs: [
    {
      indexed: true,
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'sender',
      type: 'address',
    },
  ],
  name: 'RoleGranted',
  type: 'event',
};

const RoleRevokedEventAbi: AbiEvent = {
  inputs: [
    {
      indexed: true,
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'sender',
      type: 'address',
    },
  ],
  name: 'RoleRevoked',
  type: 'event',
};

/**
 * Returns all accounts that have been granted a role in the UpgradeExecutor
 *
 * Returns an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have.
 *
 * @param {UpgradeExecutorFetchPrivilegedAccountsParams} upgradeExecutorFetchPrivilegedAccountsParams {@link UpgradeExecutorFetchPrivilegedAccountsParams}
 * @param {Address} upgradeExecutorFetchPrivilegedAccountsParams.upgradeExecutorAddress - Address of the UpgradeExecutor
 * @param {PublicClient} upgradeExecutorFetchPrivilegedAccountsParams.publicClient - The chain Viem Public Client
 *
 * @returns Promise<{@link UpgradeExecutorPrivilegedAccounts}> - an object containing the addresses of the privileged accounts as keys, and an array with a hash for each role they have
 *
 * @example
 * const privilegedAccounts = await upgradeExecutorFetchPrivilegedAccounts({
 *   upgradeExecutorAddress,
 *   publicClient,
 * });
 */
export async function upgradeExecutorFetchPrivilegedAccounts({
  upgradeExecutorAddress,
  publicClient,
}: UpgradeExecutorFetchPrivilegedAccountsParams) {
  // 0. Initialize result object
  const upgradeExecutorPrivilegedAccounts: UpgradeExecutorPrivilegedAccounts = {};

  // 1. Find the RoleGranted events
  const roleGrantedEvents = await publicClient.getLogs({
    address: upgradeExecutorAddress,
    event: RoleGrantedEventAbi,
    fromBlock: 'earliest',
    toBlock: 'latest',
  });
  if (!roleGrantedEvents || roleGrantedEvents.length <= 0) {
    // No roles have been granted
    return upgradeExecutorPrivilegedAccounts;
  }

  // 2. Add the privileged accounts to the result object
  roleGrantedEvents.forEach((roleGrantedEvent) => {
    const account = (roleGrantedEvent.args as RoleGrantedLogArgs).account;
    const role = (roleGrantedEvent.args as RoleGrantedLogArgs).role;

    if (!(account in upgradeExecutorPrivilegedAccounts)) {
      upgradeExecutorPrivilegedAccounts[account] = [];
    }
    upgradeExecutorPrivilegedAccounts[account].push(role);
  });

  // 3. Find the RoleRevoked events
  const roleRevokedEvents = await publicClient.getLogs({
    address: upgradeExecutorAddress,
    event: RoleRevokedEventAbi,
    fromBlock: 'earliest',
    toBlock: 'latest',
  });
  if (!roleRevokedEvents || roleRevokedEvents.length <= 0) {
    return upgradeExecutorPrivilegedAccounts;
  }

  // 3. Remove the revoked roles from the result object
  // (Note: if the same role has been added and revoked multiple times, it will be added and removed multiple times from upgradeExecutorPrivilegedAccounts[account] )
  roleRevokedEvents.forEach((roleRevokedEvent) => {
    const account = (roleRevokedEvent.args as RoleRevokedLogArgs).account;
    const role = (roleRevokedEvent.args as RoleRevokedLogArgs).role;

    const roleIndex = upgradeExecutorPrivilegedAccounts[account].findIndex(
      (accRole) => accRole == role,
    );
    if (roleIndex >= 0) {
      upgradeExecutorPrivilegedAccounts[account].splice(roleIndex, 1);
      if (upgradeExecutorPrivilegedAccounts[account].length === 0) {
        delete upgradeExecutorPrivilegedAccounts[account];
      }
    }
  });

  return upgradeExecutorPrivilegedAccounts;
}
