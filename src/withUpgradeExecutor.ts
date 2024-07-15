import {
  Address,
  encodeFunctionData as viemEncodeFunctionData,
  EncodeFunctionDataParameters as ViemEncodeFunctionDataParameters,
} from 'viem';
import { GetFunctionName } from './types/utils';
import { arbOwner, sequencerInbox } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';

type ABIs = typeof sequencerInbox.abi | typeof arbOwner.abi;
type FunctionName<TAbi extends ABIs> = GetFunctionName<TAbi>;

type EncodeFunctionDataParameters<
  TAbi extends ABIs,
  TFunctionName extends FunctionName<TAbi>,
> = ViemEncodeFunctionDataParameters<TAbi, TFunctionName>;

function encodeFunctionData<TAbi extends ABIs, TFunctionName extends GetFunctionName<TAbi>>({
  abi,
  functionName,
  args,
}: EncodeFunctionDataParameters<TAbi, TFunctionName>) {
  return viemEncodeFunctionData({
    abi,
    functionName,
    args,
  } as unknown as ViemEncodeFunctionDataParameters<TAbi, TFunctionName>);
}

export function withUpgradeExecutor<TAbi extends ABIs, TFunctionName extends FunctionName<TAbi>>(
  params: EncodeFunctionDataParameters<TAbi, TFunctionName> & {
    to: Address;
    upgradeExecutor: false | Address;
  },
) {
  const { upgradeExecutor } = params;
  if (!upgradeExecutor) {
    return {
      to: params.to,
      data: encodeFunctionData(params),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        params.to, // target
        encodeFunctionData(params), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}
