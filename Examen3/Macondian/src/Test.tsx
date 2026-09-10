import type { ProcessedBatch } from './statistics/types';

interface Props {
  batches: ProcessedBatch[];
  toleranceRadius: number;
  onToleranceChange: (radius: number) => void;
}

const formatValue = (value: number) =>
  Number.isFinite(value) ? value.toFixed(3) : '—';

const Test = ({ batches, toleranceRadius, onToleranceChange }: Props) => {
  const latestBatch = batches.at(-1);
  const tolerancePercent = Math.round(toleranceRadius * 100);

  return (
    <article className="panel test-panel">
      <header className="panel-header test-heading">
        <div>
          <span className="panel-eyebrow">Processed output</span>
          <h2>serie</h2>
        </div>

        <label className="tolerance-control">
          <span>Radio de tolerancia</span>
          <strong>{tolerancePercent}%</strong>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={tolerancePercent}
            onChange={(event) => onToleranceChange(Number(event.target.value) / 100)}
            aria-label="Radio Macondiano de tolerancia"
          />
        </label>
      </header>

      <div className="test-summary">
        <div className="metric">
          <span>Modelo</span>
          <strong>Mean + radius</strong>
        </div>
        <div className="metric">
          <span>Latest batch</span>
          <strong>{latestBatch ? `#${latestBatch.batchId}` : '—'}</strong>
        </div>
        <div className="metric">
          <span>Sensors</span>
          <strong>{latestBatch?.sensors.length ?? 0}</strong>
        </div>
      </div>

      <div className="series-scroll">
        {batches.length === 0 ? (
          <div className="series-empty">
            <span className="status-dot" aria-hidden="true" />
            Start Macondian to process incoming batches.
          </div>
        ) : (
          [...batches].reverse().map((batch) => (
            <section className="batch-result" key={batch.batchId}>
              <header className="batch-result-header">
                <strong>Batch {batch.batchId}</strong>
                <span>{batch.sensors.length} sensors</span>
              </header>

              <div className="series-table" role="table" aria-label={`Processed batch ${batch.batchId}`}>
                <div className="series-row series-row-head" role="row">
                  <span role="columnheader">Sensor</span>
                  <span role="columnheader">Initial μ</span>
                  <span role="columnheader">Kept</span>
                  <span role="columnheader">Outliers</span>
                  <span role="columnheader">Final μ</span>
                </div>

                {batch.sensors.map((sensor) => (
                  <div className="series-row" role="row" key={`${batch.batchId}-${sensor.sensorId}`}>
                    <span className="sensor-id" role="cell">{sensor.sensorId}</span>
                    <span role="cell">{formatValue(sensor.initialMean)}</span>
                    <span role="cell">{sensor.cleanValues.length}/{sensor.microsensorCount}</span>
                    <span className={sensor.outliers.length > 0 ? 'outlier-count has-outliers' : 'outlier-count'} role="cell">
                      {sensor.outliers.length}
                    </span>
                    <strong className="final-mean" role="cell">{formatValue(sensor.finalMean)}</strong>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </article>
  );
};

export default Test;
