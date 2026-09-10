# Statistical processing architecture

This version adds a typed streaming pipeline for the Macondian sensor data.

## Main files

- `src/statistics/StatisticalModel.ts` — injectable statistical-model contract.
- `src/statistics/ToleranceMeanModel.ts` — configurable tolerance-radius implementation.
- `src/statistics/BatchProcessor.ts` — model-agnostic batch processor.
- `src/statistics/types.ts` — raw and processed batch/sensor types.
- `src/data/macondianParser.ts` — converts the worker text protocol into typed batches and sensors.
- `src/Test.tsx` — Test-screen visualization and tolerance control.

The required course `Report.md` explanation was intentionally not written or modified.
