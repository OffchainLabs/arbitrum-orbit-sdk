type GasOverrideOptions = {
  minimum?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
  retryableTicketFees?: GasOverrideOptions;
};
