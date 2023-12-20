import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL2 } from './chains';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

const deployerPrivateKey = '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659';
const deployer = privateKeyToAccount(deployerPrivateKey);

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

it('succesfully deploys eth rollup', async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  // prepare the transaction for deploying the core contracts
  const request = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareConfig({
        chainId: BigInt(chainId),
        owner: deployer.address,
        chainConfig,
      }),
      batchPoster: deployer.address,
      validators: [deployer.address],
    },
    account: deployer.address,
    publicClient: client,
  });

  // sign and send the transaction
  const txHash = await client.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(request),
  });

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createRollupPrepareTransactionReceipt(
    await client.waitForTransactionReceipt({ hash: txHash })
  );

  expect(txReceipt.status).toEqual('success');
});
