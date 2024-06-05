import { Address, Chain, PublicClient, Transport } from 'viem';
import {
  getBatchCount,
  GetBatchCountActionParameters,
  GetBatchCountReturnType,
} from '../actions/getBatchCount';
import { getBridge, GetBridgeActionParameters, GetBridgeReturnType } from '../actions/getBridge';
import {
  getDasKeySetInfo,
  GetDasKeySetInfoActionParameters,
  GetDasKeySetInfoReturnType,
} from '../actions/getDasKeySetInfo';
import {
  getDataAuthenticatedFlag,
  GetDataAuthenticatedFlagActionParameters,
  GetDataAuthenticatedFlagReturnType,
} from '../actions/getDataAuthenticatedFlag';
import {
  getHeaderLength,
  GetHeaderLengthActionParameters,
  GetHeaderLengthReturnType,
} from '../actions/getHeaderLength';
import {
  getInboxAccs,
  GetInboxAccsActionParameters,
  GetInboxAccsReturnType,
} from '../actions/getInboxAccs';
import {
  getKeysetCreationBlock,
  GetKeysetCreationBlockActionParameters,
  GetKeysetCreationBlockReturnType,
} from '../actions/getKeysetCreationBlock';
import {
  getMaxTimeVariation,
  GetMaxTimeVariationActionParameters,
  GetMaxTimeVariationReturnType,
} from '../actions/getMaxTimeVariation';
import {
  getTotalDelayedMessagesRead,
  GetTotalDelayedMessagesReadActionParameters,
  GetTotalDelayedMessagesReadReturnType,
} from '../actions/getTotalDelayedMessagesRead';
import {
  isBatchPoster,
  IsBatchPosterActionParameters,
  IsBatchPosterReturnType,
} from '../actions/isBatchPoster';
import {
  isValidKeysetHash,
  IsValidKeysetHashActionParameters,
  IsValidKeysetHashReturnType,
} from '../actions/isValidKeysetHash';

import { getRollup, GetRollupActionParameters, GetRollupReturnType } from '../actions/getRollup';

type Params = { sequencerInbox: Address } | void;

export type PublicActionsParentChain<Curried extends boolean> = {
  getBatchCount: (
    parameters: GetBatchCountActionParameters<Curried>,
  ) => Promise<GetBatchCountReturnType>;
  getBridge: (parameters: GetBridgeActionParameters<Curried>) => Promise<GetBridgeReturnType>;
  getDasKeySetInfo: (
    parameters: GetDasKeySetInfoActionParameters<Curried>,
  ) => Promise<GetDasKeySetInfoReturnType>;
  getDataAuthenticatedFlag: (
    parameters: GetDataAuthenticatedFlagActionParameters<Curried>,
  ) => Promise<GetDataAuthenticatedFlagReturnType>;
  getHeaderLength: (
    parameters: GetHeaderLengthActionParameters<Curried>,
  ) => Promise<GetHeaderLengthReturnType>;
  getInboxAccs: (
    parameters: GetInboxAccsActionParameters<Curried>,
  ) => Promise<GetInboxAccsReturnType>;
  getKeysetCreationBlock: (
    parameters: GetKeysetCreationBlockActionParameters<Curried>,
  ) => Promise<GetKeysetCreationBlockReturnType>;
  getMaxTimeVariation: (
    parameters: GetMaxTimeVariationActionParameters<Curried>,
  ) => Promise<GetMaxTimeVariationReturnType>;
  getRollup: (parameters: GetRollupActionParameters<Curried>) => Promise<GetRollupReturnType>;
  getTotalDelayedMessagesRead: (
    parameters: GetTotalDelayedMessagesReadActionParameters<Curried>,
  ) => Promise<GetTotalDelayedMessagesReadReturnType>;
  isBatchPoster: (
    parameters: IsBatchPosterActionParameters<Curried>,
  ) => Promise<IsBatchPosterReturnType>;
  isValidKeysetHash: (
    parameters: IsValidKeysetHashActionParameters<Curried>,
  ) => Promise<IsValidKeysetHashReturnType>;
};

/**
 * Simplifies the overall typing with curried sequencerInbox address
 *
 * By design, sequencerInbox is either passed initially from the decorator, or on each call
 *
 * Address passed through each call has the priority over the address passed to the decorator, for override
 */
function getSequencerInboxAddress(params: Params, args: { sequencerInbox?: Address }): Address {
  if (params) {
    return (args.sequencerInbox ?? params.sequencerInbox) as Address;
  }
  return args.sequencerInbox as Address;
}

/**
 * Public actions for parent chain
 *
 * @example
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
 * const batchCount = await publicClientParentChain.getBatchCount()
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
      getBatchCount: (args) =>
        getBatchCount(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getBridge: (args) =>
        getBridge(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getDasKeySetInfo: (args) =>
        getDasKeySetInfo(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getDataAuthenticatedFlag: (args) =>
        getDataAuthenticatedFlag(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getHeaderLength: (args) =>
        getHeaderLength(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getInboxAccs: (args) =>
        getInboxAccs(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getKeysetCreationBlock: (args) =>
        getKeysetCreationBlock(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getMaxTimeVariation: (args) =>
        getMaxTimeVariation(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getRollup: (args) =>
        getRollup(client, {
          ...args,
          sequencerInbox: getSequencerInboxAddress(params, args),
        }),
      getTotalDelayedMessagesRead: (args) =>
        getTotalDelayedMessagesRead(client, {
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
    } satisfies PublicActionsParentChain<
      TParams extends { sequencerInbox: Address } ? true : false
    >;
  };
}
