import { it, expect } from 'vitest';
import { createPublicClient, http, parseGwei, zeroAddress } from 'viem';

import { nitroTestnodeL2 } from './chains';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransaction } from './createRollupPrepareTransaction';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

import { getTestPrivateKeyAccount } from './testHelpers';

const deployer = getTestPrivateKeyAccount();

const batchPoster = deployer.address;
const validators = [deployer.address];

const publicClient = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

it(`successfully deploys core contracts through rollup creator`, async () => {
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
      batchPoster,
      validators,
    },
    account: deployer.address,
    publicClient,
  });

  // sign and send the transaction
  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(request),
  });

  // get the transaction
  const tx = createRollupPrepareTransaction(
    await publicClient.getTransaction({ hash: txHash })
  );

  const [arg] = tx.getInputs();
  // assert all inputs are correct
  expect(arg.config).toEqual(config);
  expect(arg.batchPoster).toEqual(batchPoster);
  expect(arg.validators).toEqual(validators);
  expect(arg.maxDataSize).toEqual(104_857n);
  expect(arg.nativeToken).toEqual(zeroAddress);
  expect(arg.deployFactoriesToL2).toEqual(true);
  expect(arg.maxFeePerGasForRetryables).toEqual(parseGwei('0.1'));

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({ hash: txHash })
  );

  expect(txReceipt.status).toEqual('success');
  expect(txReceipt.getCoreContracts()).not.toThrowError();
});
