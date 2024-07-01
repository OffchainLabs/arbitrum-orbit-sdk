import { Chain, PublicClient, Transport } from 'viem';

// Getters
import {
  getAllChainOwners,
  GetAllChainOwnersParameters,
  GetAllChainOwnersReturnType,
} from '../actions/getAllChainOwners';
import {
  getInfraFeeAccount,
  GetInfraFeeAccountParameters,
  GetInfraFeeAccountReturnType,
} from '../actions/getInfraFeeAccount';
import {
  getNetworkFeeAccount,
  GetNetworkFeeAccountParameters,
  GetNetworkFeeAccountReturnType,
} from '../actions/getNetworkFeeAccount';
import {
  getScheduledUpgrade,
  GetScheduledUpgradeParameters,
  GetScheduledUpgradeReturnType,
} from '../actions/getScheduledUpgrade';
import {
  isChainOwner,
  IsChainOwnerParameters,
  IsChainOwnerReturnType,
} from '../actions/isChainOwner';
import {
  getGasAccountingParams,
  GetGasAccountingParamsParameters,
  GetGasAccountingParamsReturnType,
} from '../actions/getGasAccountingParams';
import {
  getMinimumGasPrice,
  GetMinimumGasPriceParameters,
  GetMinimumGasPriceReturnType,
} from '../actions/getMinimumGasPrice';
import {
  getParentBaseFeeEstimate,
  GetParentBaseFeeEstimateParameters,
  GetParentBaseFeeEstimateReturnType,
} from '../actions/getParentBaseFeeEstimate';
import {
  getParentRewardRate,
  GetParentRewardRateParameters,
  GetParentRewardRateReturnType,
} from '../actions/getParentRewardRate';
import {
  getParentRewardRecipient,
  GetParentRewardRecipientParameters,
  GetParentRewardRecipientReturnType,
} from '../actions/getParentRewardRecipient';
// Setters
import {
  addChainOwner,
  AddChainOwnerParameters,
  AddChainOwnerReturnType,
} from '../actions/addChainOwner';
import {
  removeChainOwner,
  RemoveChainOwnerParameters,
  RemoveChainOwnerReturnType,
} from '../actions/removeChainOwner';
import {
  setMaxTxGasLimit,
  SetMaxTxGasLimitParameters,
  SetMaxTxGasLimitReturnType,
} from '../actions/setMaxTxGasLimit';
import {
  setParentPricePerUnit,
  SetParentPricePerUnitParameters,
  SetParentPricePerUnitReturnType,
} from '../actions/setParentPricePerUnit';
import {
  setParentPricingRewardRate,
  SetParentPricingRewardRateParameters,
  SetParentPricingRewardRateReturnType,
} from '../actions/setParentPricingRewardRate';
import {
  setParentPricingRewardRecipient,
  SetParentPricingRewardRecipientParameters,
  SetParentPricingRewardRecipientReturnType,
} from '../actions/setParentPricingRewardRecipient';
import {
  setSpeedLimit,
  SetSpeedLimitParameters,
  SetSpeedLimitReturnType,
} from '../actions/setSpeedLimit';

export type PublicActionsChildChain = {
  // Getters
  getAllChainOwners: (
    parameters: GetAllChainOwnersParameters,
  ) => Promise<GetAllChainOwnersReturnType>;
  getInfraFeeAccount: (
    parameters: GetInfraFeeAccountParameters,
  ) => Promise<GetInfraFeeAccountReturnType>;
  getNetworkFeeAccount: (
    parameters: GetNetworkFeeAccountParameters,
  ) => Promise<GetNetworkFeeAccountReturnType>;
  getScheduledUpgrade: (
    parameters: GetScheduledUpgradeParameters,
  ) => Promise<GetScheduledUpgradeReturnType>;
  isChainOwner: (parameters: IsChainOwnerParameters) => Promise<IsChainOwnerReturnType>;
  getGasAccountingParams: (
    parameters: GetGasAccountingParamsParameters,
  ) => Promise<GetGasAccountingParamsReturnType>;
  getMinimumGasPrice: (
    parameters: GetMinimumGasPriceParameters,
  ) => Promise<GetMinimumGasPriceReturnType>;
  getParentBaseFeeEstimate: (
    parameters: GetParentBaseFeeEstimateParameters,
  ) => Promise<GetParentBaseFeeEstimateReturnType>;
  getParentRewardRate: (
    parameters: GetParentRewardRateParameters,
  ) => Promise<GetParentRewardRateReturnType>;
  getParentRewardRecipient: (
    parameters: GetParentRewardRecipientParameters,
  ) => Promise<GetParentRewardRecipientReturnType>;
  // Setters
  addChainOwner: (parameters: AddChainOwnerParameters) => Promise<AddChainOwnerReturnType>;
  removeChainOwner: (parameters: RemoveChainOwnerParameters) => Promise<RemoveChainOwnerReturnType>;
  setMaxTxGasLimit: (parameters: SetMaxTxGasLimitParameters) => Promise<SetMaxTxGasLimitReturnType>;
  setParentPricePerUnit: (
    parameters: SetParentPricePerUnitParameters,
  ) => Promise<SetParentPricePerUnitReturnType>;
  setParentPricingRewardRate: (
    parameters: SetParentPricingRewardRateParameters,
  ) => Promise<SetParentPricingRewardRateReturnType>;
  setParentPricingRewardRecipient: (
    parameters: SetParentPricingRewardRecipientParameters,
  ) => Promise<SetParentPricingRewardRecipientReturnType>;
  setSpeedLimit: (parameters: SetSpeedLimitParameters) => Promise<SetSpeedLimitReturnType>;
};

/**
 * Public actions for child chain
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { publicActionsChildChain } from '@arbitrum/orbit-sdk'
 *
 * export const publicClientChildChain = createPublicClient({
 *   chain: orbitChain,
 *   transport: http(),
 * }).extend(publicActionsChildChain())
 *
 * const isAChainOwner = await publicClientChildChain.isChainOwner({ address: zeroAddress })
 */
export function publicActionsChildChain<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>() {
  return (client: PublicClient<TTransport, TChain>) => {
    return {
      // Getters
      getAllChainOwners: () => getAllChainOwners(client),
      getInfraFeeAccount: () => getInfraFeeAccount(client),
      getNetworkFeeAccount: () => getNetworkFeeAccount(client),
      getScheduledUpgrade: () => getScheduledUpgrade(client),
      isChainOwner: (args) => isChainOwner(client, args),
      getGasAccountingParams: () => getGasAccountingParams(client),
      getMinimumGasPrice: () => getMinimumGasPrice(client),
      getParentBaseFeeEstimate: () => getParentBaseFeeEstimate(client),
      getParentRewardRate: () => getParentRewardRate(client),
      getParentRewardRecipient: () => getParentRewardRecipient(client),
      // Setters
      addChainOwner: (args) => addChainOwner(client, args),
      removeChainOwner: (args) => removeChainOwner(client, args),
      setMaxTxGasLimit: (args) => setMaxTxGasLimit(client, args),
      setParentPricePerUnit: (args) => setParentPricePerUnit(client, args),
      setParentPricingRewardRate: (args) => setParentPricingRewardRate(client, args),
      setParentPricingRewardRecipient: (args) => setParentPricingRewardRecipient(client, args),
      setSpeedLimit: (args) => setSpeedLimit(client, args),
    } satisfies PublicActionsChildChain;
  };
}
