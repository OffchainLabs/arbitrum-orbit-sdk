type GasOverrideOptions = {
  minimum?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
  retryableTicketGasLimit?: GasOverrideOptions;
  retryableTicketFees?: GasOverrideOptions;
};
