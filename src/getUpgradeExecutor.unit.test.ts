import { Address, EIP1193RequestFn, createPublicClient, createTransport, http, padHex } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { it, vi, describe } from 'vitest';
import { getUpgradeExecutor } from './getUpgradeExecutor';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { xai } from './testHelpers';

const rollupAddress = '0xe0875cbd144fe66c015a95e5b2d2c15c3b612179';

function mockAdminChangedEvent(previousAdmin: Address, newAdmin: Address) {
  return {
    address: '0xa58f38102579dae7c584850780dda55744f67df1',
    blockNumber: 183097536n,
    transactionHash: '0x13baa9be2bf267fde01e730855d34526f339a21f1877af175f0958e5dc546e6d',
    transactionIndex: 1,
    blockHash: '0x31d403a11112e6a8be0e24423df83341790a8c1cc1728a2c2deff1b683961635',
    logIndex: 0,
    data: '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000013300000000000000010000000000000001012160184f37a4eaea75e8252d38d5b3f0298703794d58f38b3551104ce0c2472aea78f53ccd07fdb7b1c5b08444d2be9025d519ccc21d12fd9f8b67c50615694b626aaec898b9c1e613b0c17aac28539ee667a98e08d734193de9b2e612b4b082439506aa6ff965bfff2e8d3e6ade9e038412d767778850c717b388fb17e40c359c8ef3b99b4e7aee94b88f7d96c09e8d522a0f24d90efa7db34f42cefa18ae1ab1e08f780e613e0baf8e28c322a0d52b915fcff3e143a9daa7c2ba525029066f8230120e9803fd21d332015b3ec22ae180cbd1f3cf89561a0c5bd914dc5f746d692cefcb4762a012af0fe55c1148f138221a196fbec9942400b7772ce371c8ccc8ed0cd3926398cd62f1b900758b82591174295eb7ac00555d40051ad280ceb2cfa700000000000000000000000000',
    args: {
      previousAdmin,
      newAdmin,
    },
    eventName: 'AdminChanged',
  };
}

describe.concurrent('getUpgradeExecutor', () => {
  it('should return upgrade executor on arbitrum one for xai', async ({ expect }) => {
    const arbitrumOneClient = createPublicClient({
      chain: arbitrum,
      transport: http(),
    });
    const upgradeExecutor = await getUpgradeExecutor(arbitrumOneClient, {
      rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336',
    });
    expect(upgradeExecutor).toEqual('0x0EE7AD3Cc291343C9952fFd8844e86d294fa513F');
  });

  it('should return upgrade executor on xai for xai', async ({ expect }) => {
    const xaiClient = createPublicClient({
      chain: xai,
      transport: http(),
    });
    const upgradeExecutor = await getUpgradeExecutor(xaiClient);
    expect(upgradeExecutor).toEqual('0xB30f0939c072255C9a8019B5a52Df9a364861f84');
  });

  it('should return upgrade executor on parent chain with mocked data', async ({ expect }) => {
    const randomAddress = privateKeyToAccount(generatePrivateKey()).address;
    const randomAddress2 = privateKeyToAccount(generatePrivateKey()).address;
    const randomAddress3 = privateKeyToAccount(generatePrivateKey()).address;

    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(({ method, params }) => {
          return [
            mockAdminChangedEvent(randomAddress3, randomAddress),
            mockAdminChangedEvent(randomAddress, randomAddress3),
            mockAdminChangedEvent(randomAddress3, randomAddress),
            mockAdminChangedEvent(randomAddress, randomAddress2),
          ];
        }) as unknown as EIP1193RequestFn,
        type: 'mock',
      });

    const mockClient = createPublicClient({
      transport: mockTransport,
      chain: arbitrumSepolia,
    });

    const upgradeExecutor = await getUpgradeExecutor(mockClient, {
      rollup: rollupAddress,
    });

    expect(upgradeExecutor).toEqual(randomAddress2);
  });

  it('should return upgrade executor on child chain with mocked data', async ({ expect }) => {
    const randomAddress = privateKeyToAccount(generatePrivateKey()).address;
    const randomAddress2 = privateKeyToAccount(generatePrivateKey()).address;

    const mockClient = createPublicClient({
      transport: http(),
      chain: xai,
    });

    // Mock initial getChainOwners
    const readContractSpy = vi.spyOn(mockClient, 'readContract');
    readContractSpy
      .mockImplementationOnce(async () => [randomAddress]) // getChainOwners
      .mockImplementationOnce(async () => true); // hasRole

    const upgradeExecutor = await getUpgradeExecutor(mockClient);
    expect(upgradeExecutor).toEqual(randomAddress);

    readContractSpy
      .mockImplementationOnce(async () => [randomAddress, randomAddress2]) // second getChainOwners
      .mockImplementationOnce(async () => false)
      .mockImplementationOnce(async () => true);
    const upgradeExecutor2 = await getUpgradeExecutor(mockClient);
    expect(upgradeExecutor2).toEqual(randomAddress2);
  });
});
