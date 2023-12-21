import { ArbAggregator__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ArbAggregator__factory';
import { ArbGasInfo__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ArbGasInfo__factory';
import { ArbOwnerPublic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ArbOwnerPublic__factory';
import { ArbSys__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ArbSys__factory';
import {
  ARB_GAS_INFO,
  ARB_OWNER_PUBLIC,
  ARB_SYS_ADDRESS,
} from '@arbitrum/sdk/dist/lib/dataEntities/constants';
import { OrbitHandler } from '../lib/client';
import { formatGwei } from 'viem';
import { Abi } from '../lib/types';

//
// Constants
//
const ARB_AGGREGATOR_ADDRESS = '0x000000000000000000000000000000000000006D';
const defaultSpeedLimit = 7_000_000n;
const defaultBlockGasLimit = 32_000_000n;
const defaultBaseFee = 100_000_000n;

export const precompilesHandler = async (orbitHandler: OrbitHandler): Promise<string[]> => {
  //
  // Initialization
  //
  const warningMessages: string[] = [];

  if (orbitHandler.handlesOrbitChain()) {
    //
    // Information from ArbAggregator
    //

    // Batch posters
    console.log('Batch posters');
    console.log('--------------');
    const batchPosters = (await orbitHandler.readContract(
      'orbit',
      ARB_AGGREGATOR_ADDRESS,
      ArbAggregator__factory.abi,
      'getBatchPosters',
    )) as string[];
    console.log(batchPosters);
    console.log('');

    // Fee collectors
    console.log('Fee collectors');
    console.log('--------------');
    if (batchPosters) {
      await Promise.all(
        batchPosters.map(async (batchPoster) => {
          const feeCollectors = await orbitHandler.readContract(
            'orbit',
            ARB_AGGREGATOR_ADDRESS,
            ArbAggregator__factory.abi,
            'getFeeCollector',
            [batchPoster],
          );
          console.log(`For batch poster ${batchPoster}: ${feeCollectors}`);
        }),
      );
    }
    console.log('');

    //
    // Information from ArbGasInfo
    //
    const [pricesInWeiRaw, l1BaseFeeEstimateRaw, gasAccountingParamsRaw] = await Promise.all(
      ['getPricesInWei', 'getL1BaseFeeEstimate', 'getGasAccountingParams'].map(
        async (functionName) => {
          const result = await orbitHandler.readContract(
            'orbit',
            ARB_GAS_INFO,
            ArbGasInfo__factory.abi,
            functionName,
          );
          return result;
        },
      ),
    );
    const pricesInWei = pricesInWeiRaw as bigint[];
    const l1BaseFeeEstimate = l1BaseFeeEstimateRaw as bigint;
    const gasAccountingParams = gasAccountingParamsRaw as bigint[];

    console.log('Gas prices');
    console.log('--------------');
    console.log(`Orbit base fee: ${formatGwei(pricesInWei[3])} gwei`);
    console.log(`Orbit surplus fee: ${formatGwei(pricesInWei[4])} gwei`);
    console.log(`Current gas price: ${formatGwei(pricesInWei[5])} gwei`);
    console.log(
      `Current estimate of parent chain's base fee: ${formatGwei(l1BaseFeeEstimate)} gwei`,
    );
    // console.log(`Gas price for L2 storage: ${formatGwei(pricesInWei[2])} gwei`);
    // console.log(`Cost for L1 calldata: ${formatGwei(pricesInWei[1])} gwei`);
    // console.log(`Cost of a simple transaction: ${formatGwei(pricesInWei[0])} gwei`);
    console.log('');

    if (pricesInWei[3] != defaultBaseFee) {
      warningMessages.push(
        `Orbit base fee ${formatGwei(
          pricesInWei[3],
        )} is different than the default value ${formatGwei(defaultBaseFee)}`,
      );
    }

    console.log('Gas accounting parameters');
    console.log('--------------');
    console.log(`Orbit speed limit: ${gasAccountingParams[0]} gas per second`);
    console.log(`Orbit transaction gas limit: ${gasAccountingParams[2]} gas units`);
    console.log(`Orbit block gas limit: ${gasAccountingParams[1]} gas units`);
    console.log('');

    if (gasAccountingParams[0] != defaultSpeedLimit) {
      warningMessages.push(
        `Orbit speed limit ${gasAccountingParams[0]} is different than the default value ${defaultSpeedLimit}`,
      );
    }

    if (gasAccountingParams[1] != defaultBlockGasLimit) {
      warningMessages.push(
        `Orbit block gas limit ${gasAccountingParams[1]} is different than the default value ${defaultBlockGasLimit}`,
      );
    }

    //
    // Information from ArbOwnerPublic
    //
    const [chainOwnersRaw, infraFeeAccountRaw, networkFeeAccountRaw] = await Promise.all(
      ['getAllChainOwners', 'getInfraFeeAccount', 'getNetworkFeeAccount'].map(
        async (functionName) => {
          const result = await orbitHandler.readContract(
            'orbit',
            ARB_OWNER_PUBLIC,
            ArbOwnerPublic__factory.abi,
            functionName,
          );
          return result;
        },
      ),
    );
    const chainOwners = chainOwnersRaw as `0x${string}`[];
    const infraFeeAccount = infraFeeAccountRaw as `0x${string}`;
    const networkFeeAccount = networkFeeAccountRaw as `0x${string}`;

    console.log('Chain owners');
    console.log('--------------');
    console.log(chainOwners);
    console.log('');

    console.log('Fee receivers');
    console.log('--------------');
    console.log(`Infrastructure fee receiver (L2BaseFee): ${infraFeeAccount}`);
    console.log(`Network fee receiver (L2SurplusFee): ${networkFeeAccount}`);
    console.log('');

    //
    // Information from ArbSys
    //
    console.log('Protocol information');
    console.log('--------------');
    const [chainIdRaw, arbOSVersionRaw] = await Promise.all(
      ['arbChainID', 'arbOSVersion'].map(async (functionName) => {
        const result = await orbitHandler.readContract(
          'orbit',
          ARB_SYS_ADDRESS,
          ArbSys__factory.abi as Abi,
          functionName,
        );
        return result;
      }),
    );
    const chainId = chainIdRaw as bigint;
    const arbOSVersion = arbOSVersionRaw as bigint;
    const nitroBaseArbOSVersion = 55n;

    console.log(`Orbit chain id: ${chainId}`);
    console.log(`ArbOS version: ${arbOSVersion - nitroBaseArbOSVersion}`);
    console.log('');
  }

  return warningMessages;
};
