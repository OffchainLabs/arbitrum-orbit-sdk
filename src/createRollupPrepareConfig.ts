import { ChainConfig } from './types/ChainConfig';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';
import { defaults as defaultsCommon } from './createRollupPrepareDeploymentParamsConfigDefaults';
// importing for jsdoc @link to work
import { createRollupPrepareDeploymentParamsConfig } from './createRollupPrepareDeploymentParamsConfig';
import { Prettify } from './types/utils';

export type CreateRollupPrepareConfigResult = CreateRollupFunctionInputs[0]['config'];

type RequiredKeys = 'chainId' | 'owner';
type RequiredParams = Pick<CreateRollupPrepareConfigResult, RequiredKeys>;
type OptionalParams = Partial<Omit<CreateRollupPrepareConfigResult, 'chainConfig' | RequiredKeys>>;

export type CreateRollupPrepareConfigParams = Prettify<
  RequiredParams & { chainConfig?: ChainConfig } & OptionalParams
>;

export const defaults = {
  ...defaultsCommon,
  confirmPeriodBlocks: BigInt(150),
  sequencerInboxMaxTimeVariation: {
    delayBlocks: BigInt(5_760),
    futureBlocks: BigInt(48),
    delaySeconds: BigInt(86_400),
    futureSeconds: BigInt(3_600),
  },
} as const;

/**
 * @deprecated Will be removed in a future release. Please use {@link createRollupPrepareDeploymentParamsConfig} instead.
 */
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
