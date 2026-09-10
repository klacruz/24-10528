import type { StatisticalModel } from './StatisticalModel';
import type { ProcessedBatch, RawBatch } from './types';

/**
 * Processes batches without knowing which statistical model is being used.
 * This is the injection point: swap the model, keep the streaming pipeline.
 */
export class BatchProcessor {
  constructor(private readonly model: StatisticalModel) {}

  process(batch: RawBatch): ProcessedBatch {
    return {
      batchId: batch.batchId,
      receivedAt: batch.receivedAt,
      sensors: batch.sensors.map((sensor) => ({
        sensorIndex: sensor.sensorIndex,
        sensorId: sensor.sensorId,
        microsensorCount: sensor.microsensors.length,
        ...this.model.process(sensor.microsensors),
      })),
    };
  }
}
