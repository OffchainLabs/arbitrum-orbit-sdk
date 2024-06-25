import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { createRollupFetchCoreContracts } from './createRollupFetchCoreContracts';
import { arbitrumOne } from './chains';

const xaiRollupAddress = '0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336';
const xaiCoreContracts = {
  rollup: '0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336',
  inbox: '0xaE21fDA3de92dE2FDAF606233b2863782Ba046F9',
  nativeToken: '0x4Cb9a7AE498CEDcBb5EAe9f25736aE7d428C9D66',
  outbox: '0x1E400568AD4840dbE50FB32f306B842e9ddeF726',
  rollupEventInbox: '0x36aDe24988E4C47602e38BD9a0Bd89031eF807a8',
  challengeManager: '0x3a3f62034a42a35eA1686B199bB73006aa525eE4',
  adminProxy: '0x041F85dD87c46B941dc9b15c6628B19ee5358485',
  sequencerInbox: '0x995a9d3ca121D48d21087eDE20bc8acb2398c8B1',
  bridge: '0x7dd8A76bdAeBE3BBBaCD7Aa87f1D4FDa1E60f94f',
  upgradeExecutor: '0x0EE7AD3Cc291343C9952fFd8844e86d294fa513F',
  validatorUtils: '0x6c21303F5986180B1394d2C89f3e883890E2867b',
  validatorWalletCreator: '0x2b0E04Dc90e3fA58165CB41E2834B44A56E766aF',
  deployedAtBlockNumber: 166757506,
};

const client = createPublicClient({
  chain: arbitrumOne,
  transport: http(),
});

it('should return core contracts', async () => {
  const coreContracts = await createRollupFetchCoreContracts({
    rollup: xaiRollupAddress,
    publicClient: client,
  });
  expect(coreContracts).toEqual(xaiCoreContracts);
});

it("should fallback to multicall if there's any error", async () => {
  // Trigger the fallback to multicall
  client.getLogs = async () => [];

  const coreContracts = await createRollupFetchCoreContracts({
    rollup: xaiRollupAddress,
    publicClient: client,
  });
  expect(coreContracts).toEqual(xaiCoreContracts);
});
