import { PublicClient } from 'viem';

import { ChainConfig } from './types/ChainConfig';
import { validateParentChain } from './types/ParentChain';
import { Prettify } from './types/utils';

import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';

import { defaults } from './createRollupPrepareDeploymentParamsConfigDefaults';
import { getDefaultConfirmPeriodBlocks } from './getDefaultConfirmPeriodBlocks';
import { getDefaultSequencerInboxMaxTimeVariation } from './getDefaultSequencerInboxMaxTimeVariation';

export type CreateRollupPrepareConfigResult = CreateRollupFunctionInputs[0]['config'];

type RequiredKeys = 'chainId' | 'owner';
type RequiredParams = Pick<CreateRollupPrepareConfigResult, RequiredKeys>;
type OptionalParams = Partial<Omit<CreateRollupPrepareConfigResult, 'chainConfig' | RequiredKeys>>;

export type CreateRollupPrepareConfigParams = Prettify<
  RequiredParams & { chainConfig?: ChainConfig } & OptionalParams
>;

export function createRollupPrepareDeploymentParamsConfig(
  client: PublicClient,
  { chainConfig, ...params }: CreateRollupPrepareConfigParams,
): CreateRollupPrepareConfigResult {
  const parentChainId = validateParentChain(client);

  const defaultsBasedOnParentChain = {
    confirmPeriodBlocks: getDefaultConfirmPeriodBlocks(parentChainId),
    sequencerInboxMaxTimeVariation: getDefaultSequencerInboxMaxTimeVariation(parentChainId),
  };

  return {
    ...defaults,
    ...defaultsBasedOnParentChain,
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
