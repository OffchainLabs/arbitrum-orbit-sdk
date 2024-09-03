import { createPublicClient, http } from 'viem';
import { getParentChainFromId, sanitizePrivateKey } from '@arbitrum/orbit-sdk/utils';
import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import { privateKeyToAccount } from 'viem/accounts';
import {
  MetaTransactionData,
  OperationType
} from '@safe-global/safe-core-sdk-types'

export async function propose(to: string, data: string, rollupOwnerSafeAddress: string): Promise<void> {
  const parentChainId = Number(process.env.PARENT_CHAIN_ID);
  const parentChain = getParentChainFromId(parentChainId);
  let h = http()
  if (typeof process.env.RPC !== 'undefined') {
    h = http(process.env.RPC)
  }
  const parentChainPublicClient = createPublicClient({
    chain: parentChain,
    transport: h,
  });

  const safeTransactionData: MetaTransactionData = {
    to: to as `0x${string}`,
    value: '0',
    data: data as `0x${string}`,
    operation: OperationType.Call
  }
  const protocolKitOwner1 = await Safe.default.init({
    provider: parentChainPublicClient.transport,
    signer: process.env.OWNER_1_ADDRESS_PRIVATE_KEY as `${string}`,
    safeAddress: process.env.SAFE_ADDRESS as `0x${string}`,
  })
  const safeTransaction = await protocolKitOwner1.createTransaction({
    transactions: [safeTransactionData]
  })
  // Propose transaction to the service
  const chainId = BigInt(String(process.env.PARENT_CHAIN_ID));
  const apiKit = new SafeApiKit.default({
    chainId: chainId, // set the correct chainId
  })
  const safeTxHash = await protocolKitOwner1.getTransactionHash(safeTransaction)
  const signature = await protocolKitOwner1.signHash(safeTxHash)
  const senderAddress = privateKeyToAccount(sanitizePrivateKey(process.env.OWNER_1_ADDRESS_PRIVATE_KEY as `${string}`));
  await apiKit.proposeTransaction({
    safeAddress: rollupOwnerSafeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: senderAddress.address,
    senderSignature: signature.data
  })
  console.log('Transaction proposed.')
}
