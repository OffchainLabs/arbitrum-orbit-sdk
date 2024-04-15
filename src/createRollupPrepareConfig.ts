import { parseEther, zeroAddress } from 'viem';

import { ChainConfig } from './types/ChainConfig';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';

type RequiredKeys = 'chainId' | 'owner';

export type CreateRollupPrepareConfigResult = CreateRollupFunctionInputs[0]['config'];

export type CreateRollupPrepareConfigParams = Pick<CreateRollupPrepareConfigResult, RequiredKeys> &
  Partial<Omit<CreateRollupPrepareConfigResult | 'chainConfig', RequiredKeys>> & {
    chainConfig?: ChainConfig;
  };

const wasmModuleRoot: `0x${string}` =
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
  '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4';

export const defaults = {
  confirmPeriodBlocks: BigInt(150),
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot,
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
  sequencerInboxMaxTimeVariation: {
    delayBlocks: BigInt(5_760),
    futureBlocks: BigInt(48),
    delaySeconds: BigInt(86_400),
    futureSeconds: BigInt(3_600),
  },
};

export function createRollupPrepareConfig({
  chainConfig,
  ...params
}: CreateRollupPrepareConfigParams): CreateRollupPrepareConfigResult {
  return {
    ...defaults,
    ...params,
    chainConfig: JSON.stringify(
      chainConfig ??
        prepareChainConfig({
          chainId: Number(params.chainId),
          arbitrum: { InitialChainOwner: params.owner },
        }),
    ),
  };
}
