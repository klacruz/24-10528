import type { SensorReading } from '../statistics/types';

export type MacondianMessage =
  | { kind: 'batch'; batchId: number }
  | { kind: 'sensor'; sensor: SensorReading }
  | { kind: 'other' };

const batchPattern = /^Batch\s+(\d+):\s*$/;
const sensorPattern = /^(\d+)\s+(\S+)\s+\[\s*([^\]]*)\s*\]\s*$/;

/** Converts the worker's textual protocol into typed data. */
export const parseMacondianMessage = (message: string): MacondianMessage => {
  const batchMatch = message.match(batchPattern);
  if (batchMatch) {
    return { kind: 'batch', batchId: Number(batchMatch[1]) };
  }

  const sensorMatch = message.match(sensorPattern);
  if (sensorMatch) {
    const microsensors = sensorMatch[3]
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));

    return {
      kind: 'sensor',
      sensor: {
        sensorIndex: Number(sensorMatch[1]),
        sensorId: sensorMatch[2],
        microsensors,
      },
    };
  }

  return { kind: 'other' };
};
