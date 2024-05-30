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

    const { isComplete: isCompleteInitially, validators: initialValidators } = await getValidators(
      client,
      {
        rollupAddress: l3Rollup,
      },
    );
    // By default, chains from nitro testnode has 10 validators
    expect(initialValidators).toHaveLength(10);
    expect(isCompleteInitially).toBeTruthy();

    await setValidator(randomAccount, false);
    await setValidator(randomAccount, false);

    const { isComplete: isStillComplete, validators: newValidators } = await getValidators(client, {
      rollupAddress: l3Rollup,
    });
    // Setting the same validator multiple time to false doesn't add new validators
    expect(newValidators).toEqual(initialValidators);
    expect(isStillComplete).toBeTruthy();

    await setValidator(randomAccount, true);
    const { validators, isComplete } = await getValidators(client, { rollupAddress: l3Rollup });
    expect(validators).toEqual(initialValidators.concat(randomAccount));
    expect(isComplete).toBeTruthy();

    // Reset state for future tests
    await setValidator(randomAccount, false);
  });

  it('when enabling the same validators multiple time', async () => {
    const randomAccount = privateKeyToAccount(generatePrivateKey()).address;

    const { isComplete: isCompleteInitially, validators: initialValidators } = await getValidators(
      client,
      {
        rollupAddress: l3Rollup,
      },
    );
    // By default, chains from nitro testnode has 10 validators
    expect(initialValidators).toHaveLength(10);
    expect(isCompleteInitially).toBeTruthy();

    await setValidator(randomAccount, true);
    await setValidator(randomAccount, true);
    const { isComplete: isStillComplete, validators: newValidators } = await getValidators(client, {
      rollupAddress: l3Rollup,
    });

    expect(newValidators).toEqual(initialValidators.concat(randomAccount));
    expect(isStillComplete).toBeTruthy();

    await setValidator(randomAccount, false);
    const { validators, isComplete } = await getValidators(client, { rollupAddress: l3Rollup });
    expect(validators).toEqual(initialValidators);
    expect(isComplete).toBeTruthy();
  });

  it('when adding an existing validator', async () => {
    const { isComplete: isCompleteInitially, validators: initialValidators } = await getValidators(
      client,
      { rollupAddress: l3Rollup },
    );
    expect(initialValidators).toHaveLength(10);
    expect(isCompleteInitially).toBeTruthy();

    const firstValidator = initialValidators[0];
    await setValidator(firstValidator, true);

    const { isComplete, validators } = await getValidators(client, { rollupAddress: l3Rollup });
    expect(validators).toEqual(initialValidators);
    expect(isComplete).toBeTruthy();
  });

  it('when removing an existing validator', async () => {
    const { isComplete: isCompleteInitially, validators: initialValidators } = await getValidators(
      client,
      { rollupAddress: l3Rollup },
    );
    expect(initialValidators).toHaveLength(10);
    expect(isCompleteInitially).toBeTruthy();

    const lastValidator = initialValidators[initialValidators.length - 1];
    await setValidator(lastValidator, false);
    const { isComplete, validators } = await getValidators(client, { rollupAddress: l3Rollup });
    expect(validators).toEqual(initialValidators.slice(0, -1));
    expect(isComplete).toBeTruthy();

    await setValidator(lastValidator, true);
    const { isComplete: isCompleteFinal, validators: validatorsFinal } = await getValidators(client, { rollupAddress: l3Rollup })
    expect(validatorsFinal).toEqual(initialValidators);
    expect(isCompleteFinal).toBeTruthy()
  });
});
