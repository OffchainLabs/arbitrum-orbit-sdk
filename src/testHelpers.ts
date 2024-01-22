import { PublicClient } from 'viem';
import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { config } from 'dotenv';

import {
  CreateRollupTransactionReceipt,
  createRollupPrepareTransactionReceipt,
} from './createRollupPrepareTransactionReceipt';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';

config();

export function getTestPrivateKeyAccount(): PrivateKeyAccount & { privateKey: `0x${string}` } {
  const privateKey = process.env.PRIVATE_KEY;

  if (typeof privateKey === 'undefined') {
    throw Error(`missing PRIVATE_KEY env variable`);
  }

  const sanitizedPrivateKey = sanitizePrivateKey(privateKey);

  return { ...privateKeyToAccount(sanitizedPrivateKey), privateKey: sanitizedPrivateKey };
}

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}

export type TestSetupCreateRollupParameters = {
  publicClient: PublicClient;
};

export async function testSetupCreateRollup({
  publicClient,
}: TestSetupCreateRollupParameters): Promise<CreateRollupTransactionReceipt> {
  const deployer = getTestPrivateKeyAccount();

  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  const config = createRollupPrepareConfig({
    chainId: BigInt(chainId),
    owner: deployer.address,
    chainConfig,
  });

  // prepare the transaction for deploying the core contracts
  const request = await createRollupPrepareTransactionRequest({
    params: {
      config,
      batchPoster: deployer.address,
      validators: [deployer.address],
    },
    account: deployer.address,
    publicClient,
  });

  // sign and send the transaction
  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(request),
  });

  // get the transaction receipt after waiting for the transaction to complete
  return createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({ hash: txHash }),
  );
}
