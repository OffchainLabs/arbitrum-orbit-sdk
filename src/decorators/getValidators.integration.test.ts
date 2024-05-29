import { describe, it, expect } from 'vitest';
import { Address, createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL2 } from '../chains';
import { rollupAdminLogicPublicActions } from './rollupAdminLogicPublicActions';
import { getInformationFromTestnode, getNitroTestnodePrivateKeyAccounts } from '../testHelpers';
import { getValidators } from '../getValidators';

const { l3RollupOwner } = getNitroTestnodePrivateKeyAccounts();
const { l3Rollup, l3UpgradeExecutor } = getInformationFromTestnode();

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(
  rollupAdminLogicPublicActions({
    rollup: l3Rollup,
  }),
);

async function setValidator(validator: Address, state: boolean) {
  const tx = await client.rollupAdminLogicPrepareTransactionRequest({
    functionName: 'setValidator',
    args: [[validator], [state]],
    account: l3RollupOwner.address,
    upgradeExecutor: l3UpgradeExecutor,
    rollup: l3Rollup,
  });

  await client.sendRawTransaction({
    serializedTransaction: await l3RollupOwner.signTransaction(tx),
  });
}

describe('successfully get validators', async () => {
  it('when disabling the same validator multiple time', async () => {
    const randomAccount = privateKeyToAccount(generatePrivateKey()).address;

    const initialValidators = await getValidators(client, { rollupAddress: l3Rollup });
    // By default, chains from nitro testnode has 10 validators
    expect(initialValidators).toHaveLength(10);

    await setValidator(randomAccount, false);
    await setValidator(randomAccount, false);

    const newValidators = await getValidators(client, { rollupAddress: l3Rollup });
    // Setting the same validator multiple time to false doesn't add new validators
    expect(newValidators).toEqual(initialValidators);

    await setValidator(randomAccount, true);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(
      initialValidators.concat(randomAccount),
    );

    // Reset state for future tests
    await setValidator(randomAccount, false);
  });

  it('when enabling the same validators multiple time', async () => {
    const randomAccount = privateKeyToAccount(generatePrivateKey()).address;

    const initialValidators = await getValidators(client, { rollupAddress: l3Rollup });
    expect(initialValidators).toHaveLength(10);

    await setValidator(randomAccount, true);
    await setValidator(randomAccount, true);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(
      initialValidators.concat(randomAccount),
    );

    await setValidator(randomAccount, false);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(initialValidators);
  });

  it('when adding an existing validator', async () => {
    const initialValidators = await getValidators(client, { rollupAddress: l3Rollup });
    expect(initialValidators).toHaveLength(10);

    const firstValidator = initialValidators[0];
    await setValidator(firstValidator, true);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(initialValidators);
  });

  it('when removing an existing validator', async () => {
    const initialValidators = await getValidators(client, { rollupAddress: l3Rollup });
    expect(initialValidators).toHaveLength(10);

    const firstValidator = initialValidators[0];
    await setValidator(firstValidator, false);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(
      initialValidators.slice(1, initialValidators.length),
    );

    await setValidator(firstValidator, true);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(initialValidators);
  });
});
