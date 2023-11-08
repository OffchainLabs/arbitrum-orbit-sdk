import { parseEther, zeroAddress } from 'viem';

import { CreateRollupFunctionParams } from './createRollup';
import { createChainConfig } from './createChainConfig';
import { ChainConfig } from './types/ChainConfig';

type RequiredKeys = 'chainId' | 'owner';

export type CreateRollupConfigResult = CreateRollupFunctionParams['config'];

export type CreateRollupConfigParams = Pick<
  CreateRollupConfigResult,
  RequiredKeys
> &
  Partial<Omit<CreateRollupConfigResult | 'chainConfig', RequiredKeys>> & {
    chainConfig?: ChainConfig;
  };

const wasmModuleRoot: `0x${string}` =
  '0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17';

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

export function createRollupConfig({
  chainConfig,
  ...params
}: CreateRollupConfigParams): CreateRollupConfigResult {
  return {
    ...defaults,
    ...params,
    chainConfig: JSON.stringify(
      chainConfig ??
        createChainConfig({
          chainId: Number(params.chainId),
          arbitrum: { InitialChainOwner: params.owner },
        })
    ),
  };
}
