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

async function toggleValidator(validator: Address, state: boolean) {
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
    // By default, nitro chains have 10 validators
    expect(initialValidators).toHaveLength(10);

    await toggleValidator(randomAccount, false);
    await toggleValidator(randomAccount, false);

    const newValidators = await getValidators(client, { rollupAddress: l3Rollup })
    // Setting the same validator multiple time to false doesn't add new validators
    expect(newValidators).toEqual(initialValidators)

    await toggleValidator(randomAccount, true);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(
      initialValidators.concat(randomAccount)
    )
    
    // Reset state for future tests
    await toggleValidator(randomAccount, false);
  });

  it('when enabling the same validators multiple time', async () => {
    const randomAccount = privateKeyToAccount(generatePrivateKey()).address;

    const initialValidators = await getValidators(client, { rollupAddress: l3Rollup });
    expect(initialValidators).toHaveLength(10)

    await toggleValidator(randomAccount, true);
    await toggleValidator(randomAccount, true);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(initialValidators.concat(randomAccount));

    await toggleValidator(randomAccount, false);
    expect(await getValidators(client, { rollupAddress: l3Rollup })).toEqual(initialValidators);
  });
});
