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
    if (params) {
      return {
        getBatchCount: (args) =>
          getBatchCount(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getBridge: (args) =>
          getBridge(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getDasKeySetInfo: (args) =>
          getDasKeySetInfo(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getDataAuthenticatedFlag: (args) =>
          getDataAuthenticatedFlag(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getHeaderLength: (args) =>
          getHeaderLength(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getInboxAccs: (args) =>
          getInboxAccs(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getKeysetCreationBlock: (args) =>
          getKeysetCreationBlock(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getMaxTimeVariation: (args) =>
          getMaxTimeVariation(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getRollup: (args) =>
          getRollup(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        getTotalDelayedMessagesRead: (args) =>
          getTotalDelayedMessagesRead(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        isBatchPoster: (args) =>
          isBatchPoster(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
        isValidKeysetHash: (args) =>
          isValidKeysetHash(client, {
            ...args,
            sequencerInbox: (args && args.sequencerInbox) ?? params.sequencerInbox,
          }),
      } satisfies PublicActionsParentChain<true>;
    }

    return {
      getBatchCount: (args) =>
        getBatchCount(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getBridge: (args) =>
        getBridge(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getDasKeySetInfo: (args) =>
        getDasKeySetInfo(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getDataAuthenticatedFlag: (args) =>
        getDataAuthenticatedFlag(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getHeaderLength: (args) =>
        getHeaderLength(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getInboxAccs: (args) =>
        getInboxAccs(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getKeysetCreationBlock: (args) =>
        getKeysetCreationBlock(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getMaxTimeVariation: (args) =>
        getMaxTimeVariation(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getRollup: (args) =>
        getRollup(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      getTotalDelayedMessagesRead: (args) =>
        getTotalDelayedMessagesRead(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      isBatchPoster: (args) =>
        isBatchPoster(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
      isValidKeysetHash: (args) =>
        isValidKeysetHash(client, {
          ...args,
          sequencerInbox: args.sequencerInbox,
        }),
    } satisfies PublicActionsParentChain<false>;
  };
}
