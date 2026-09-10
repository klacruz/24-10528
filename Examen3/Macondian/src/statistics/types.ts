export interface SensorReading {
  sensorIndex: number;
  sensorId: string;
  microsensors: number[];
}

export interface RawBatch {
  batchId: number;
  receivedAt: number;
  sensors: SensorReading[];
}

export interface StatisticalResult {
  initialMean: number;
  cleanValues: number[];
  outliers: number[];
  finalMean: number;
}

export interface ProcessedSensorReading extends StatisticalResult {
  sensorIndex: number;
  sensorId: string;
  microsensorCount: number;
}

export interface ProcessedBatch {
  batchId: number;
  receivedAt: number;
  sensors: ProcessedSensorReading[];
}
