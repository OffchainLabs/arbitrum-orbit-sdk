import { Address, encodeFunctionData, EncodeFunctionDataParameters, keccak256, PublicClient, toHex } from 'viem';
import { AbiEvent } from 'abitype'
import { upgradeExecutor } from './contracts';
import { GetFunctionName, Prettify } from './types/utils';

export type UpgradeExecutorAbi = typeof upgradeExecutor.abi;

export type UpgradeExecutorFunctionName = GetFunctionName<UpgradeExecutorAbi>;

export type UpgradeExecutorEncodeFunctionDataParameters<
  TFunctionName extends UpgradeExecutorFunctionName,
> = Prettify<Omit<EncodeFunctionDataParameters<UpgradeExecutorAbi, TFunctionName>, 'abi'>>;

export function upgradeExecutorEncodeFunctionData<
  TFunctionName extends UpgradeExecutorFunctionName,
>({ functionName, args }: UpgradeExecutorEncodeFunctionDataParameters<TFunctionName>) {
  // todo: fix this weird type issue
  //
  // @ts-ignore
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName,
    args,
  });
}

export type UpgradeExecutorFetchPrivilegedAccountsParams = {
  upgradeExecutorAddress: Address;
  publicClient: PublicClient;
};

export type UpgradeExecutorPrivilegedAccounts = {
  // Key: account
  // Value: array of roles
  [key: `0x${string}`]: `0x${string}`[];
};

export const UPGRADE_EXECUTOR_ROLE_ADMIN = keccak256(toHex('ADMIN_ROLE'));
export const UPGRADE_EXECUTOR_ROLE_EXECUTOR = keccak256(toHex('EXECUTOR_ROLE'));

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
  name: 'RoleGranted',
  type: 'event',
};

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

    const roleIndex = upgradeExecutorPrivilegedAccounts[account].findIndex((accRole) => accRole == role);
    if (roleIndex >= 0) {
      upgradeExecutorPrivilegedAccounts[account] = upgradeExecutorPrivilegedAccounts[account].splice(roleIndex, 1);
    }
  });

  return upgradeExecutorPrivilegedAccounts;
}
function hex(arg0: string): `0x${string}` | Uint8Array {
  throw new Error('Function not implemented.');
}

