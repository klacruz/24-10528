import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProcessedBatch } from './statistics/types';

interface Props {
  batches: ProcessedBatch[];
  windowSize?: number;
}

type SensorPoint = {
  batchId: number;
  receivedAt: number;
  value: number;
};

type SensorSeries = {
  sensorId: string;
  points: SensorPoint[];
};

type NormalizedPoint = {
  batchId: number;
  x: number;
  y: number;
};

type NormalizedSeries = {
  sensorId: string;
  points: NormalizedPoint[];
};

const SERIES_COLORS = [
  '#66A3FF',
  '#47D7A1',
  '#F4BF63',
  '#B98CFF',
  '#FF7474',
  '#4DD4E8',
  '#FF9F66',
  '#A3E635',
];

const DEFAULT_WINDOW_SIZE = 48;
const ANIMATION_MS = 280;

const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(3);
};

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp);

const buildSeries = (batches: ProcessedBatch[]): SensorSeries[] => {
  const map = new Map<string, SensorPoint[]>();

  batches.forEach((batch) => {
    batch.sensors.forEach((sensor) => {
      const points = map.get(sensor.sensorId) ?? [];
      points.push({
        batchId: batch.batchId,
        receivedAt: batch.receivedAt,
        value: sensor.finalMean,
      });
      map.set(sensor.sensorId, points);
    });
  });

  return [...map.entries()]
    .map(([sensorId, points]) => ({ sensorId, points }))
    .sort((a, b) => a.sensorId.localeCompare(b.sensorId));
};

const normalizeSeries = (
  series: SensorSeries[],
  batchIds: number[],
  yMin: number,
  yMax: number,
): NormalizedSeries[] => {
  const batchIndex = new Map(batchIds.map((batchId, index) => [batchId, index]));
  const xDenominator = Math.max(batchIds.length - 1, 1);
  const yRange = yMax - yMin || 1;

  return series.map((item) => ({
    sensorId: item.sensorId,
    points: item.points.map((point) => ({
      batchId: point.batchId,
      x: (batchIndex.get(point.batchId) ?? 0) / xDenominator,
      y: 1 - ((point.value - yMin) / yRange),
    })),
  }));
};

const pointKey = (sensorId: string, batchId: number) => `${sensorId}:${batchId}`;

const interpolateFrame = (
  from: NormalizedSeries[],
  target: NormalizedSeries[],
  progress: number,
): NormalizedSeries[] => {
  const previous = new Map<string, NormalizedPoint>();
  const previousLastBySensor = new Map<string, NormalizedPoint>();

  from.forEach((series) => {
    series.points.forEach((point) => {
      previous.set(pointKey(series.sensorId, point.batchId), point);
      previousLastBySensor.set(series.sensorId, point);
    });
  });

  return target.map((series) => ({
    sensorId: series.sensorId,
    points: series.points.map((targetPoint) => {
      const startPoint =
        previous.get(pointKey(series.sensorId, targetPoint.batchId)) ??
        previousLastBySensor.get(series.sensorId) ??
        targetPoint;

      return {
        batchId: targetPoint.batchId,
        x: startPoint.x + (targetPoint.x - startPoint.x) * progress,
        y: startPoint.y + (targetPoint.y - startPoint.y) * progress,
      };
    }),
  }));
};

const getColor = (sensorId: string, index: number) => {
  const hash = [...sensorId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return SERIES_COLORS[(hash + index) % SERIES_COLORS.length] ?? SERIES_COLORS[0];
};

const drawChart = (
  canvas: HTMLCanvasElement,
  frame: NormalizedSeries[],
  visibleBatches: ProcessedBatch[],
  yMin: number,
  yMax: number,
) => {
  const context = canvas.getContext('2d');
  if (!context) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);

  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const styles = getComputedStyle(canvas);
  const gridColor = styles.getPropertyValue('--chart-grid').trim() || 'rgba(148,163,184,.12)';
  const labelColor = styles.getPropertyValue('--text-3').trim() || '#8290a5';

  const padding = { top: 16, right: 18, bottom: 30, left: 54 };
  const plotWidth = Math.max(width - padding.left - padding.right, 1);
  const plotHeight = Math.max(height - padding.top - padding.bottom, 1);

  context.lineWidth = 1;
  context.strokeStyle = gridColor;
  context.fillStyle = labelColor;
  context.font = '11px SFMono-Regular, Consolas, monospace';
  context.textBaseline = 'middle';

  const horizontalGridLines = 4;
  for (let index = 0; index <= horizontalGridLines; index += 1) {
    const ratio = index / horizontalGridLines;
    const y = padding.top + plotHeight * ratio;
    const labelValue = yMax - (yMax - yMin) * ratio;

    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(padding.left + plotWidth, y);
    context.stroke();

    context.textAlign = 'right';
    context.fillText(formatNumber(labelValue), padding.left - 8, y);
  }

  const xTickCount = Math.min(5, visibleBatches.length);
  if (xTickCount > 0) {
    for (let tick = 0; tick < xTickCount; tick += 1) {
      const batchIndex = xTickCount === 1
        ? 0
        : Math.round((tick / (xTickCount - 1)) * (visibleBatches.length - 1));
      const batch = visibleBatches[batchIndex];
      if (!batch) continue;

      const ratio = visibleBatches.length === 1
        ? 0
        : batchIndex / (visibleBatches.length - 1);
      const x = padding.left + plotWidth * ratio;

      context.textAlign = tick === 0 ? 'left' : tick === xTickCount - 1 ? 'right' : 'center';
      context.textBaseline = 'top';
      context.fillText(formatTime(batch.receivedAt), x, padding.top + plotHeight + 10);
    }
  }

  frame.forEach((series, seriesIndex) => {
    if (series.points.length === 0) return;

    const color = getColor(series.sensorId, seriesIndex);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();

    series.points.forEach((point, pointIndex) => {
      const x = padding.left + point.x * plotWidth;
      const y = padding.top + point.y * plotHeight;
      if (pointIndex === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    context.stroke();

    const lastPoint = series.points.at(-1);
    if (lastPoint) {
      const x = padding.left + lastPoint.x * plotWidth;
      const y = padding.top + lastPoint.y * plotHeight;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, 3.2, 0, Math.PI * 2);
      context.fill();
    }
  });
};

const Chart = ({ batches, windowSize = DEFAULT_WINDOW_SIZE }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderedFrameRef = useRef<NormalizedSeries[]>([]);
  const animationRef = useRef<number | null>(null);
  const [selectedSensor, setSelectedSensor] = useState('all');

  const visibleBatches = useMemo(
    () => batches.slice(-windowSize),
    [batches, windowSize],
  );

  const allSeries = useMemo(() => buildSeries(visibleBatches), [visibleBatches]);
  const sensorIds = useMemo(() => allSeries.map((series) => series.sensorId), [allSeries]);

  useEffect(() => {
    if (selectedSensor !== 'all' && !sensorIds.includes(selectedSensor)) {
      setSelectedSensor('all');
    }
  }, [selectedSensor, sensorIds]);

  const displayedSeries = useMemo(
    () => selectedSensor === 'all'
      ? allSeries
      : allSeries.filter((series) => series.sensorId === selectedSensor),
    [allSeries, selectedSensor],
  );

  const values = useMemo(
    () => displayedSeries.flatMap((series) => series.points.map((point) => point.value)),
    [displayedSeries],
  );

  const yDomain = useMemo(() => {
    if (values.length === 0) return { min: 0, max: 1 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range === 0 ? Math.max(Math.abs(max) * 0.08, 0.5) : range * 0.1;
    return { min: min - padding, max: max + padding };
  }, [values]);

  const targetFrame = useMemo(
    () => normalizeSeries(
      displayedSeries,
      visibleBatches.map((batch) => batch.batchId),
      yDomain.min,
      yDomain.max,
    ),
    [displayedSeries, visibleBatches, yDomain],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const from = renderedFrameRef.current;
    const startedAt = performance.now();

    const render = (timestamp: number) => {
      const linearProgress = Math.min((timestamp - startedAt) / ANIMATION_MS, 1);
      const progress = 1 - Math.pow(1 - linearProgress, 3);
      const frame = interpolateFrame(from, targetFrame, progress);

      renderedFrameRef.current = frame;
      drawChart(canvas, frame, visibleBatches, yDomain.min, yDomain.max);

      if (linearProgress < 1) {
        animationRef.current = requestAnimationFrame(render);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(render);

    const observer = new ResizeObserver(() => {
      drawChart(
        canvas,
        renderedFrameRef.current.length > 0 ? renderedFrameRef.current : targetFrame,
        visibleBatches,
        yDomain.min,
        yDomain.max,
      );
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [targetFrame, visibleBatches, yDomain]);

  const latestBatch = visibleBatches.at(-1);
  const latestValues = latestBatch
    ? latestBatch.sensors
      .filter((sensor) => selectedSensor === 'all' || sensor.sensorId === selectedSensor)
      .map((sensor) => sensor.finalMean)
    : [];

  const latest = latestValues.length > 0 ? mean(latestValues) : 0;
  const average = values.length > 0 ? mean(values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  return (
    <article className="panel chart-panel">
      <header className="panel-header chart-heading">
        <div>
          <span className="panel-eyebrow">Processed output</span>
          <h2>Temporal series</h2>
        </div>

        <div className="chart-controls">
          <label className="chart-filter">
            <span>Sensor</span>
            <select
              value={selectedSensor}
              onChange={(event) => setSelectedSensor(event.target.value)}
              aria-label="Select sensor to chart"
            >
              <option value="all">All sensors</option>
              {sensorIds.map((sensorId) => (
                <option value={sensorId} key={sensorId}>{sensorId}</option>
              ))}
            </select>
          </label>
          <span className="chart-badge">{batches.length > 0 ? 'Live' : 'Waiting'}</span>
        </div>
      </header>

      <div className="chart-kpis">
        <div className="metric">
          <span>{selectedSensor === 'all' ? 'Latest avg' : 'Latest'}</span>
          <strong>{values.length > 0 ? formatNumber(latest) : '—'}</strong>
        </div>
        <div className="metric">
          <span>Window avg</span>
          <strong>{values.length > 0 ? formatNumber(average) : '—'}</strong>
        </div>
        <div className="metric">
          <span>Range</span>
          <strong>{values.length > 0 ? `${formatNumber(min)}–${formatNumber(max)}` : '—'}</strong>
        </div>
        <div className="metric">
          <span>Batches</span>
          <strong>{visibleBatches.length}</strong>
        </div>
      </div>

      <div className="chart-stage chart-stage-live">
        {visibleBatches.length === 0 ? (
          <div className="chart-empty">
            <span className="status-dot" aria-hidden="true" />
            Start Macondian to chart processed batches in real time.
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="stream-chart-canvas"
            aria-label="Real-time chart of processed sensor averages"
          />
        )}
      </div>

      <footer className="chart-footer chart-footer-live">
        <div className="chart-legend" aria-label="Sensor legend">
          {displayedSeries.map((series, index) => (
            <span className="chart-legend-item" key={series.sensorId}>
              <i style={{ backgroundColor: getColor(series.sensorId, index) }} />
              {series.sensorId}
            </span>
          ))}
        </div>
        <span>Last {windowSize} batches max · {ANIMATION_MS} ms smoothing</span>
      </footer>
    </article>
  );
};

export default Chart;
