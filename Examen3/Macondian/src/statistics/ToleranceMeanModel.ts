import type { StatisticalModel } from './StatisticalModel';
import type { StatisticalResult } from './types';

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Smooths a sensor's microsensor readings in three steps:
 * 1. Compute the initial arithmetic mean.
 * 2. Reject readings whose distance from that mean exceeds a configurable
 *    percentage of the mean (the Macondian tolerance radius).
 * 3. Compute the mean again using only the retained readings.
 */
export class ToleranceMeanModel implements StatisticalModel {
  readonly name = 'Tolerance mean';

  constructor(readonly toleranceRadius = 0.10) {
    if (!Number.isFinite(toleranceRadius) || toleranceRadius < 0) {
      throw new RangeError('toleranceRadius must be a finite number >= 0');
    }
  }

  process(microsensors: readonly number[]): StatisticalResult {
    if (microsensors.length === 0) {
      return {
        initialMean: Number.NaN,
        cleanValues: [],
        outliers: [],
        finalMean: Number.NaN,
      };
    }

    const initialMean = mean(microsensors);
    const toleranceMargin = Math.abs(initialMean) * this.toleranceRadius;

    const cleanValues: number[] = [];
    const outliers: number[] = [];

    for (const value of microsensors) {
      const isInsideTolerance = Math.abs(value - initialMean) <= toleranceMargin;
      (isInsideTolerance ? cleanValues : outliers).push(value);
    }

    // Defensive fallback: if an extreme configuration rejects every reading,
    // preserve a meaningful estimate instead of producing a divide-by-zero.
    const finalMean = cleanValues.length > 0 ? mean(cleanValues) : initialMean;

    return {
      initialMean,
      cleanValues,
      outliers,
      finalMean,
    };
  }
}
