# Real-time Chart integration

The Chart view now consumes the same `ProcessedBatch[]` produced by `BatchProcessor`.

## Data flow

`Worker -> parser -> RawBatch[] -> BatchProcessor -> ProcessedBatch[] -> Chart`

Each batch receives a `receivedAt` timestamp when its `Batch` message arrives. The x-axis therefore represents arrival time, while each sensor line plots its `finalMean` from the injected statistical model.

## Performance choices

- Canvas rendering instead of creating a large number of SVG/DOM nodes.
- Only the latest 48 batches are drawn by default.
- `requestAnimationFrame` interpolates the previous rendered frame into the newest one over 280 ms.
- `ResizeObserver` keeps the canvas crisp and responsive at the current device pixel ratio.
- No chart dependency was added to `package.json`.
