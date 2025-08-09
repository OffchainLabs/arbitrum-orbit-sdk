import { it, expectTypeOf } from 'vitest';
import { createPublicClient, http } from 'viem';

import { arbitrumOne } from '../chains';
import { createRollupPrepareDeploymentParamsConfig } from './index';
import {
  CreateRollupPrepareDeploymentParamsConfigParams as v2Dot1Params,
  CreateRollupPrepareDeploymentParamsConfigResult as v2Dot1Result,
} from './v2.1';
import {
  CreateRollupPrepareDeploymentParamsConfigParams as v3Dot1Params,
  CreateRollupPrepareDeploymentParamsConfigResult as v3Dot1Result,
} from './v3.1';

const client = createPublicClient({
  chain: arbitrumOne,
  transport: http(),
});

const baseParams = {
  owner: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' as const,
  chainId: 69_420n,
};

it('no version parameter defaults to v3.1 types', () => {
  const result = createRollupPrepareDeploymentParamsConfig(client, baseParams);

  expectTypeOf(result).toEqualTypeOf<v3Dot1Result>();
  expectTypeOf(result).not.toEqualTypeOf<v2Dot1Result>();
});

it('explicit v3.1 parameter uses v3.1 types', () => {
  const result = createRollupPrepareDeploymentParamsConfig(client, baseParams, 'v3.1');

  expectTypeOf(result).toEqualTypeOf<v3Dot1Result>();
  expectTypeOf(result).not.toEqualTypeOf<v2Dot1Result>();
});

it('explicit v2.1 parameter uses v2.1 types', () => {
  const result = createRollupPrepareDeploymentParamsConfig(client, baseParams, 'v2.1');

  expectTypeOf(result).toEqualTypeOf<v2Dot1Result>();
  expectTypeOf(result).not.toEqualTypeOf<v3Dot1Result>();
});
