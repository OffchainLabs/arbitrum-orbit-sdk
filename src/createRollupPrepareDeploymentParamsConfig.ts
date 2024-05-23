import { PublicClient } from 'viem';

import { ChainConfig } from './types/ChainConfig';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';
import { validateParentChain } from './types/ParentChain';
import { defaults } from './createRollupPrepareDeploymentParamsConfigDefaults';
import { getDefaultConfirmPeriodBlocks } from './getDefaultConfirmPeriodBlocks';
import { getDefaultSequencerInboxMaxTimeVariation } from './getDefaultSequencerInboxMaxTimeVariation';

type RequiredKeys = 'chainId' | 'owner';

export type CreateRollupPrepareConfigResult = CreateRollupFunctionInputs[0]['config'];

export type CreateRollupPrepareConfigParams = Pick<CreateRollupPrepareConfigResult, RequiredKeys> &
  Partial<Omit<CreateRollupPrepareConfigResult | 'chainConfig', RequiredKeys>> & {
    chainConfig?: ChainConfig;
  };

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
