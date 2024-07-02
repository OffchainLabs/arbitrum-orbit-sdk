import {
  Chain,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { rollupAdminLogic } from '../contracts';
import { WithAccount, WithContractAddress } from '../types/Actions';
import { Prettify } from '../types/utils';
import { getRollupAddress } from '../getRollupAddress';

export type SetValidatorWhitelistDisabledParameters<Curried extends boolean = false> = Prettify<
  WithAccount<WithContractAddress<{}, 'rollupAdminLogic', Curried>>
>;

export type SetValidatorWhitelistDisabledReturnType = PrepareTransactionRequestReturnType;

function rollupAdminLogicFunctionData({
  enable,
}: SetValidatorWhitelistDisabledParameters & { enable: boolean }) {
  return encodeFunctionData({
    abi: rollupAdminLogic.abi,
    functionName: 'setValidatorWhitelistDisabled',
    args: [enable],
  });
}

async function setValidatorWhitelistDisabled<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetValidatorWhitelistDisabledParameters & { enable: boolean },
): Promise<SetValidatorWhitelistDisabledReturnType> {
  const data = rollupAdminLogicFunctionData(args);
  const rollupAdminLogicAddresss = await getRollupAddress(client, args);
  return client.prepareTransactionRequest({
    to: rollupAdminLogicAddresss,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}

export async function enableValidatorWhitelist<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetValidatorWhitelistDisabledParameters,
): Promise<SetValidatorWhitelistDisabledReturnType> {
  return setValidatorWhitelistDisabled(client, {
    ...args,
    enable: true,
  });
}

export async function disableValidatorWhitelist<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetValidatorWhitelistDisabledParameters,
): Promise<SetValidatorWhitelistDisabledReturnType> {
  return setValidatorWhitelistDisabled(client, {
    ...args,
    enable: false,
  });
}
