import type { StatisticalResult } from './types';

/**
 * Contract for any statistical smoothing model that can be injected into the
 * batch processor. New models only need to implement this interface.
 */
export interface StatisticalModel {
  readonly name: string;
  process(microsensors: readonly number[]): StatisticalResult;
}
