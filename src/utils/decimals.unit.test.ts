import { parseEther } from 'viem';
import { describe, expect, it } from 'vitest';
import { nativeTokenDecimalsTo18Decimals, scaleToNativeTokenDecimals } from './decimals';

const AMOUNT_TO_SCALE = parseEther('1.23456789');

describe('Native token', () => {
  it('scales to native token decimals', () => {
    expect(scaleToNativeTokenDecimals({ amount: AMOUNT_TO_SCALE, decimals: 18 })).toEqual(
      BigInt('1234567890000000000'),
    );

    // Rounds up the last digit - in this case no decimals so rounds up 1 to 2
    expect(scaleToNativeTokenDecimals({ amount: AMOUNT_TO_SCALE, decimals: 0 })).toEqual(BigInt(2));

    // Rounds up the last digit
    expect(scaleToNativeTokenDecimals({ amount: AMOUNT_TO_SCALE, decimals: 1 })).toEqual(13n);

    // Rounds up the last digit
    expect(
      scaleToNativeTokenDecimals({
        amount: AMOUNT_TO_SCALE,
        decimals: 6,
      }),
    ).toEqual(1234568n);

    // Rounds up the last digit
    expect(scaleToNativeTokenDecimals({ amount: AMOUNT_TO_SCALE, decimals: 7 })).toEqual(12345679n);

    // Does not round up the last digit because all original decimals are included
    expect(scaleToNativeTokenDecimals({ amount: AMOUNT_TO_SCALE, decimals: 8 })).toEqual(
      123456789n,
    );

    // Does not round up the last digit because all original decimals are included
    expect(scaleToNativeTokenDecimals({ amount: AMOUNT_TO_SCALE, decimals: 9 })).toEqual(
      1234567890n,
    );

    // Does not round up the last digit because all original decimals are included
    expect(
      scaleToNativeTokenDecimals({
        amount: AMOUNT_TO_SCALE,
        decimals: 24,
      }),
    ).toEqual(1234567890000000000000000n);
  });

  it('scales native token decimals to 18 decimals', () => {
    expect(
      nativeTokenDecimalsTo18Decimals({
        amount: AMOUNT_TO_SCALE,
        decimals: 16,
      }),
    ).toEqual(123456789000000000000n);

    expect(
      nativeTokenDecimalsTo18Decimals({
        amount: AMOUNT_TO_SCALE,
        decimals: 18,
      }),
    ).toEqual(1234567890000000000n);

    expect(
      nativeTokenDecimalsTo18Decimals({
        amount: AMOUNT_TO_SCALE,
        decimals: 20,
      }),
    ).toEqual(12345678900000000n);
  });
});
