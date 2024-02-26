import { GetFunctionArgs } from 'viem';

import { rollupCreator } from '../contracts';

export type CreateRollupFunctionInputs = GetFunctionArgs<
  typeof rollupCreator.abi,
  'createRollup'
>['args'];

type RequiredKeys = 'config' | 'batchPoster' | 'validators';

export type CreateRollupParams = Pick<CreateRollupFunctionInputs[0], RequiredKeys> &
  Partial<Omit<CreateRollupFunctionInputs[0], RequiredKeys>>;
