import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { nitroTestnodeL1, nitroTestnodeL2, nitroTestnodeL3 } from '../chains';
import { getInformationFromTestnode } from '../testHelpers';
import { registerNewNetwork } from './registerNewNetwork';
import { publicClientToProvider } from '../ethers-compat/publicClientToProvider';
import { L2Network, l1Networks, l2Networks } from '@arbitrum/sdk/dist/lib/dataEntities/networks';

const nitroTestnodeL1Client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(nitroTestnodeL1.rpcUrls.default.http[0]),
});

const nitroTestnodeL2Client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(nitroTestnodeL2.rpcUrls.default.http[0]),
});

const nitroTestnodeL3Client = createPublicClient({
  chain: nitroTestnodeL3,
  transport: http(nitroTestnodeL3.rpcUrls.default.http[0]),
});

const l1Provider = publicClientToProvider(nitroTestnodeL1Client);
const l2Provider = publicClientToProvider(nitroTestnodeL2Client);
const l3Provider = publicClientToProvider(nitroTestnodeL3Client);

it('should register L1 and L2 respectively as L1 and L2', async () => {
  const testnodeInformation = getInformationFromTestnode();
  const { parentNetwork, childNetwork } = await registerNewNetwork(
    l1Provider,
    l2Provider,
    testnodeInformation.rollup,
  );

  expect(parentNetwork.chainID).toEqual(nitroTestnodeL1.id);
  expect(childNetwork.chainID).toEqual(nitroTestnodeL2.id);
  expect(Object.keys(l1Networks)).toContain(nitroTestnodeL1.id.toString());
  expect(Object.keys(l2Networks)).toContain(nitroTestnodeL2.id.toString());
  expect(parentNetwork.partnerChainIDs).toContain(nitroTestnodeL2.id);
  expect(childNetwork.partnerChainID).toEqual(nitroTestnodeL1.id);
});

it('should register L2 and L3 as L2', async () => {
  const testnodeInformation = getInformationFromTestnode();
  const { parentNetwork, childNetwork } = await registerNewNetwork(
    l2Provider,
    l3Provider,
    testnodeInformation.l3Rollup,
  );

  expect(parentNetwork.chainID).toEqual(nitroTestnodeL2.id);
  expect(childNetwork.chainID).toEqual(nitroTestnodeL3.id);
  expect(Object.keys(l2Networks)).toContain(nitroTestnodeL2.id.toString());
  expect(Object.keys(l2Networks)).toContain(nitroTestnodeL3.id.toString());
  expect(parentNetwork.partnerChainIDs).toContain(nitroTestnodeL3.id);
  expect((parentNetwork as L2Network).partnerChainID).toEqual(nitroTestnodeL1.id);
  expect(childNetwork.partnerChainID).toBe(parentNetwork.chainID);
  expect(childNetwork.partnerChainID).toEqual(nitroTestnodeL2.id);
});

it('should not throw an error if registering L2/L3 after L1/L2', async () => {
  const testnodeInformation = getInformationFromTestnode();
  await registerNewNetwork(l1Provider, l2Provider, testnodeInformation.rollup);
  await registerNewNetwork(l2Provider, l3Provider, testnodeInformation.l3Rollup);
  await registerNewNetwork(l1Provider, l2Provider, testnodeInformation.rollup);

  expect(() =>
    registerNewNetwork(l2Provider, l3Provider, testnodeInformation.l3Rollup),
  ).not.toThrow();
  expect(Object.keys(l2Networks)).toContain(nitroTestnodeL2.id.toString());
  expect(Object.keys(l2Networks)).toContain(nitroTestnodeL3.id.toString());
  expect(Object.keys(l1Networks)).not.toContain(nitroTestnodeL2.id.toString());
});
