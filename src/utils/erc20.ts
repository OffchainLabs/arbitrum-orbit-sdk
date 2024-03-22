import { Address, PublicClient, WalletClient, encodeFunctionData } from 'viem';

import { erc20 } from '../contracts';

function approveEncodeFunctionData({ spender, amount }: { spender: Address; amount: bigint }) {
  return encodeFunctionData({
    abi: erc20.abi,
    functionName: 'approve',
    args: [spender, amount],
  });
}

export type ApprovePrepareTransactionRequestProps = {
  address: Address;
  owner: Address;
  spender: Address;
  amount: bigint;
  publicClient: PublicClient;
};

export async function approvePrepareTransactionRequest({
  address,
  owner,
  spender,
  amount,
  publicClient,
}: ApprovePrepareTransactionRequestProps) {
  return await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: address,
    data: approveEncodeFunctionData({ spender, amount }),
    value: BigInt(0),
    account: owner,
  });
}

export type ApproveProps = {
  address: Address;
  spender: Address;
  amount: bigint;
  publicClient: PublicClient;
  walletClient: WalletClient;
};

export async function approve({
  address,
  spender,
  amount,
  publicClient,
  walletClient,
}: ApproveProps) {
  const account = walletClient.account?.address;

  if (typeof account === 'undefined') {
    throw new Error('[utils/erc20::approve] account is undefined');
  }

  const { request } = await publicClient.simulateContract({
    address: address,
    abi: erc20.abi,
    functionName: 'approve',
    args: [spender, amount],
    account,
  });

  const hash = await walletClient.writeContract(request);
  return await publicClient.waitForTransactionReceipt({ hash: hash });
}

export type FetchAllowanceProps = {
  address: Address;
  owner: Address;
  spender: Address;
  publicClient: PublicClient;
};

export async function fetchAllowance({
  address,
  owner,
  spender,
  publicClient,
}: FetchAllowanceProps) {
  return publicClient.readContract({
    address,
    abi: erc20.abi,
    functionName: 'allowance',
    args: [owner, spender],
  });
}

export function fetchDecimals({
  address,
  publicClient,
}: {
  address: Address;
  publicClient: PublicClient;
}) {
  return publicClient.readContract({
    address,
    abi: erc20.abi,
    functionName: 'decimals',
  });
}
