import { Address, GetFunctionArgs } from 'viem';

import { rollupCreatorABI } from '../contracts/RollupCreator';
import { rollupCreatorABI as rollupCreatorV1Dot1ABI } from '../contracts/RollupCreator/v1.1';

import { Prettify } from './utils';

export type RollupCreatorVersion = 'v2.1' | 'v1.1';
export type RollupCreatorLatestVersion = Extract<RollupCreatorVersion, 'v2.1'>;

export type RollupCreatorABI<TVersion extends RollupCreatorVersion = RollupCreatorLatestVersion> =
  //
  TVersion extends 'v2.1'
    ? typeof rollupCreatorABI
    : TVersion extends 'v1.1'
    ? typeof rollupCreatorV1Dot1ABI
    : never;

export type CreateRollupFunctionInputs<
  TVersion extends RollupCreatorVersion = RollupCreatorLatestVersion,
> = GetFunctionArgs<RollupCreatorABI<TVersion>, 'createRollup'>['args'];

type GetCreateRollupRequiredKeys<
  TVersion extends RollupCreatorVersion = RollupCreatorLatestVersion,
> =
  //
  TVersion extends 'v2.1'
    ? 'config' | 'batchPosters' | 'validators'
    : TVersion extends 'v1.1'
    ? 'config' | 'batchPoster' | 'validators'
    : never;

export type CreateRollupParams<TVersion extends RollupCreatorVersion = RollupCreatorLatestVersion> =
  Prettify<
    // @ts-ignore this works perfectly fine, not sure why typescript is complaining
    Pick<CreateRollupFunctionInputs<TVersion>[0], GetCreateRollupRequiredKeys<TVersion>> &
      // @ts-ignore this works perfectly fine, not sure why typescript is complaining
      Partial<Omit<CreateRollupFunctionInputs<TVersion>[0], GetCreateRollupRequiredKeys<TVersion>>>
  >;

export type WithRollupCreatorAddressOverride<T> = T & {
  /**
   * Specifies a custom address for the RollupCreator. By default, the address will be automatically detected based on the provided chain.
   */
  rollupCreatorAddressOverride?: Address;
};
