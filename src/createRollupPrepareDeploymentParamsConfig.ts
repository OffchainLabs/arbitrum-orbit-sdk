import { Chain, Client, Transport } from 'viem';

import {
  createRollupPrepareDeploymentParamsConfig as createRollupPrepareDeploymentParamsConfigV2Dot1,
  CreateRollupPrepareDeploymentParamsConfigParams as CreateRollupPrepareDeploymentParamsConfigParamsV2Dot1,
  CreateRollupPrepareDeploymentParamsConfigResult as CreateRollupPrepareDeploymentParamsConfigResultV2Dot1,
} from './createRollupPrepareDeploymentParamsConfig-v2.1';
import {
  createRollupPrepareDeploymentParamsConfig as createRollupPrepareDeploymentParamsConfigV3Dot1,
  CreateRollupPrepareDeploymentParamsConfigParams as CreateRollupPrepareDeploymentParamsConfigParamsV3Dot1,
  CreateRollupPrepareDeploymentParamsConfigResult as CreateRollupPrepareDeploymentParamsConfigResultV3Dot1,
} from './createRollupPrepareDeploymentParamsConfig-v3.1';

export type CreateRollupPrepareDeploymentParamsConfigParams =
  | ({
      rollupCreatorVersion: 'v2.1';
    } & CreateRollupPrepareDeploymentParamsConfigParamsV2Dot1)
  | ({
      rollupCreatorVersion: 'v3.1';
    } & CreateRollupPrepareDeploymentParamsConfigParamsV3Dot1)
  | ({
      rollupCreatorVersion?: never;
    } & CreateRollupPrepareDeploymentParamsConfigParamsV3Dot1);

export type CreateRollupPrepareDeploymentParamsConfigResult<TVersion extends 'v3.1' | 'v2.1'> =
  TVersion extends 'v2.1'
    ? CreateRollupPrepareDeploymentParamsConfigResultV2Dot1
    : TVersion extends 'v3.1'
    ? CreateRollupPrepareDeploymentParamsConfigResultV3Dot1
    : never;

export function createRollupPrepareDeploymentParamsConfig<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  params: CreateRollupPrepareDeploymentParamsConfigParamsV2Dot1 & { rollupCreatorVersion: 'v2.1' },
): CreateRollupPrepareDeploymentParamsConfigResult<'v2.1'>;
export function createRollupPrepareDeploymentParamsConfig<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  params: CreateRollupPrepareDeploymentParamsConfigParamsV3Dot1 & { rollupCreatorVersion: 'v3.1' },
): CreateRollupPrepareDeploymentParamsConfigResult<'v3.1'>;
export function createRollupPrepareDeploymentParamsConfig<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  params: CreateRollupPrepareDeploymentParamsConfigParamsV3Dot1 & {
    rollupCreatorVersion?: never;
  },
): CreateRollupPrepareDeploymentParamsConfigResult<'v3.1'>;
export function createRollupPrepareDeploymentParamsConfig<
  TChain extends Chain | undefined,
  TRollupCreatorVersion extends 'v3.1' | 'v2.1',
>(
  client: Client<Transport, TChain>,
  params: CreateRollupPrepareDeploymentParamsConfigParams,
): CreateRollupPrepareDeploymentParamsConfigResult<TRollupCreatorVersion> {
  const rollupCreatorVersion =
    'rollupCreatorVersion' in params && typeof params.rollupCreatorVersion === 'string'
      ? params.rollupCreatorVersion
      : 'v3.1';

  if (rollupCreatorVersion === 'v2.1') {
    return createRollupPrepareDeploymentParamsConfigV2Dot1(
      client,
      params as CreateRollupPrepareDeploymentParamsConfigParamsV2Dot1,
    );
  }

  return createRollupPrepareDeploymentParamsConfigV3Dot1(
    client,
    params as CreateRollupPrepareDeploymentParamsConfigParamsV3Dot1,
  );
}

const x = createRollupPrepareDeploymentParamsConfig(undefined, {
  rollupCreatorVersion: 'v3.1',
});
