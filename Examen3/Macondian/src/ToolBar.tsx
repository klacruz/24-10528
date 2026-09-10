///
/// ToolBar
///

interface Props {
  start: () => void;
  reset: () => void;
  uxColor: (mode: number) => string;
  setUX: (mode: number) => void;
  error?: string;
}

const modes = [
  { id: 0, label: 'Raw' },
  { id: 1, label: 'Test' },
  { id: 2, label: 'Chart' },
  { id: 3, label: 'Image' },
  { id: 4, label: 'List' },
];

const ToolBar = (props: Props) => {
  return (
    <div className="app-toolbar" aria-label="Macondian controls">
      <div className="toolbar-actions">
        <button
          className="button button-primary"
          title="Start the Macondian Reactor"
          onClick={props.start}
        >
          <span className="button-dot" aria-hidden="true" />
          Start Macondian
        </button>

        <button
          className="button button-secondary"
          title="Reset the Macondian Reactor"
          onClick={props.reset}
        >
          Reset
        </button>
      </div>

      <nav className="view-switcher" aria-label="View mode">
        {modes.map((mode) => {
          const active = props.uxColor(mode.id) === 'Yellow';
          return (
            <button
              key={mode.id}
              className={`view-tab ${active ? 'is-active' : ''}`}
              title={`${mode.label} view`}
              onClick={() => props.setUX(mode.id)}
              aria-pressed={active}
            >
              {mode.label}
            </button>
          );
        })}
      </nav>

      <div className="toolbar-status" aria-live="polite">
        {props.error ? (
          <span className="toolbar-error">{props.error}</span>
        ) : (
          <span className="system-online">
            <span className="status-dot" aria-hidden="true" />
            System ready
          </span>
        )}
      </div>
    </div>
  );
};

export default ToolBar;
