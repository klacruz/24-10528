# Macondian UI redesign

This pass keeps the existing application logic, Web Worker, resizeable split layout, CLI commands and view modes intact while modernizing the interface.

## Main visual system

- Background: `#080C14`
- Elevated background: `#0D1320`
- Surface: `#101827`
- Border: `#22304A`
- Primary accent: `#66A3FF`
- Success / live: `#47D7A1`
- Warning: `#F4BF63`
- Error: `#FF7474`
- Main text: `#EDF3FB`
- Secondary text: `#9AA9BF`

All tokens are defined at the top of `src/index.css`, so the palette can be changed without touching the components.

## Changed files

- `src/index.css`: new dashboard design system and responsive behavior.
- `src/ToolBar.tsx`: modern action bar + segmented view navigation.
- `src/Monitor.tsx`: card/terminal treatment and `history` dependency bug fixed to `log`.
- `src/CLI.tsx`: compact command dock.
- `src/Image.tsx`: responsive image stage using `object-fit: contain` to prevent distortion/cropping.
- `src/Chart.tsx`: responsive SVG chart presentation with KPI header; uses preview values only when no real series is supplied.

## Image scaling

The image component uses:

```css
.responsive-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}
```

This preserves the image's original aspect ratio at any panel size.

## Chart data

`Chart` still accepts `number[]`. When the actual processed series is connected, pass it through the existing `data` prop. The preview series disappears automatically when `data.length > 1`.
