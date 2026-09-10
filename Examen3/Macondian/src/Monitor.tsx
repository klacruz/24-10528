///
/// Monitor: read-only, scrollable view of session history.
///

import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  log: string[];
}

const Monitor = ({ title, log }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  return (
    <article className="panel monitor-panel">
      <header className="panel-header">
        <div>
          <span className="panel-eyebrow">Live monitor</span>
          <h2>{title}</h2>
        </div>
        <div className="panel-meta">
          <span className="live-indicator"><span className="status-dot" />Live</span>
          <span>{log.length} lines</span>
        </div>
      </header>

      <div className="terminal-wrap">
        <div className="terminal-chrome" aria-hidden="true">
          <span /><span /><span />
        </div>
        <textarea
          ref={ref}
          readOnly
          spellCheck={false}
          className="pane-fill terminal-output"
          value={log.join('\n')}
          placeholder="Waiting for signal…"
          aria-label={`${title} output`}
        />
      </div>
    </article>
  );
};

export default Monitor;
