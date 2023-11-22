import { Address } from 'viem';

export type ChainConfigArbitrumParams = {
  EnableArbOS: boolean;
  AllowDebugPrecompiles: boolean;
  DataAvailabilityCommittee: boolean;
  InitialArbOSVersion: number;
  InitialChainOwner: Address;
  GenesisBlockNum: number;
  MaxCodeSize: number;
  MaxInitCodeSize: number;
};

export type ChainConfig = {
  chainId: number;
  homesteadBlock: number;
  daoForkBlock: null;
  daoForkSupport: boolean;
  eip150Block: number;
  eip150Hash: string;
  eip155Block: number;
  eip158Block: number;
  byzantiumBlock: number;
  constantinopleBlock: number;
  petersburgBlock: number;
  istanbulBlock: number;
  muirGlacierBlock: number;
  berlinBlock: number;
  londonBlock: number;
  clique: {
    period: number;
    epoch: number;
  };
  arbitrum: ChainConfigArbitrumParams;
};
