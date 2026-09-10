///
/// CLI.tsx
///

import { SubmitEvent } from 'react';

interface Props {
  req: (event: SubmitEvent<HTMLFormElement>) => void;
  ref: React.RefObject<HTMLInputElement | null>;
}

const CLI = (props: Props) => {
  return (
    <form className="cli-form" onSubmit={props.req}>
      <span className="cli-prefix" aria-hidden="true">›</span>
      <input
        className="cli-command"
        ref={props.ref}
        placeholder="Enter command (.start, .reset…)"
        aria-label="Command line"
      />
      <button className="cli-submit" type="submit" aria-label="Run command">
        Run
      </button>
    </form>
  );
};

export default CLI;
