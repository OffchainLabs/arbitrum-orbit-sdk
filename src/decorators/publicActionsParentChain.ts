import { Address, Chain, PublicClient, Transport } from 'viem';

// Getters
import {
  getMaxTimeVariation,
  GetMaxTimeVariationParameters,
  GetMaxTimeVariationReturnType,
} from '../actions/getMaxTimeVariation';
import {
  isBatchPoster,
  IsBatchPosterParameters,
  IsBatchPosterReturnType,
} from '../actions/isBatchPoster';
import {
  isValidKeysetHash,
  IsValidKeysetHashParameters,
  IsValidKeysetHashReturnType,
} from '../actions/isValidKeysetHash';
// Setters
import {
  invalidateKeysetHash,
  InvalidateKeysetHashParameters,
  InvalidateKeysetHashReturnType,
} from '../actions/invalidateKeysetHash';
import {
  enableBatchPoster,
  disableBatchPoster,
  SetIsBatchPosterParameters,
  SetIsBatchPosterReturnType,
} from '../actions/setIsbatchPoster';
import { setKeyset, SetKeysetParameters, SetKeysetReturnType } from '../actions/setKeyset';
import {
  setMaxTimeVariation,
  SetMaxTimeVariationParameters,
  SetMaxTimeVariationReturnType,
} from '../actions/setMaxTimeVariation';

type Params = { sequencerInbox: Address } | void;

export type PublicActionsParentChain<Curried extends boolean> = {
  // Getters
  getMaxTimeVariation: (
    parameters: GetMaxTimeVariationParameters<Curried>,
  ) => Promise<GetMaxTimeVariationReturnType>;
  isBatchPoster: (parameters: IsBatchPosterParameters<Curried>) => Promise<IsBatchPosterReturnType>;
  isValidKeysetHash: (
    parameters: IsValidKeysetHashParameters<Curried>,
  ) => Promise<IsValidKeysetHashReturnType>;
  // Setters
  invalidateKeysetHash: (
    parameters: InvalidateKeysetHashParameters<Curried>,
  ) => Promise<InvalidateKeysetHashReturnType>;
  enableBatchPoster: (
    parameters: SetIsBatchPosterParameters<Curried>,
  ) => Promise<SetIsBatchPosterReturnType>;
  disableBatchPoster: (
    parameters: SetIsBatchPosterParameters<Curried>,
  ) => Promise<SetIsBatchPosterReturnType>;
  setKeyset: (parameters: SetKeysetParameters<Curried>) => Promise<SetKeysetReturnType>;
  setMaxTimeVariation: (
    parameters: SetMaxTimeVariationParameters<Curried>,
  ) => Promise<SetMaxTimeVariationReturnType>;
};

/**
 * Simplifies the overall typing with curried sequencerInbox address
 *
 * By design, sequencerInbox is either passed initially from the decorator, or on each call
 *
 * Address passed through each call has the priority over the address passed to the decorator, for override
 */

function getSequencerInboxAddress(
  params: Params,
  args: { sequencerInbox?: Address } | void,
): Address {
  return ((args && args.sequencerInbox) ?? (params && params.sequencerInbox)) as unknown as Address;
}

/**
 * Public actions for parent chain
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { publicActionsParentChain } from '@arbitrum/orbit-sdk'
 * import { arbitrum } from 'viem/chains'
 *
 * export const publicClientParentChain = createPublicClient({
 *   chain: arbitrum,
 *   transport: http(),
 * }).extend(publicActionsParentChain({
 *   sequencerInbox: '0x1c479675ad559DC151F6Ec7ed3FbF8ceE79582B6'
 * }))
 *
 * const { delayBlocks, futureBlocks, delaySeconds, futureSeconds } = await publicClientParentChain.getMaxTimeVariation()
 */
export function publicActionsParentChain<
  TParams extends Params = void,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(params: void): (client: PublicClient<TTransport, TChain>) => PublicActionsParentChain<false>;
export function publicActionsParentChain<
  TParams extends Params = { sequencerInbox: Address },
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(params: TParams): (client: PublicClient<TTransport, TChain>) => PublicActionsParentChain<true>;
export function publicActionsParentChain<
  TParams extends Params,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(params: TParams) {
  return (client: PublicClient<TTransport, TChain>) => {
    // sequencerInbox is curried, sequencerInbox param is optional.
    return {
      // Getters
      getMaxTimeVariation: (args) =>
        getMaxTimeVariation(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      isBatchPoster: (args) =>
        isBatchPoster(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      isValidKeysetHash: (args) =>
        isValidKeysetHash(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      // Setters
      invalidateKeysetHash: (args) =>
        invalidateKeysetHash(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      enableBatchPoster: (args) =>
        enableBatchPoster(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      disableBatchPoster: (args) =>
        disableBatchPoster(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      setKeyset: (args) =>
        setKeyset(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      setMaxTimeVariation: (args) =>
        setMaxTimeVariation(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
    } satisfies PublicActionsParentChain<
      TParams extends { sequencerInbox: Address } ? true : false
    >;
  };
}
