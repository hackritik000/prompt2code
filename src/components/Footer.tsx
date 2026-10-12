import React from 'react';
import { WEIGHTS } from '../constants/weights';

/**
 * Footer showing the dynamic mathematical weight breakdown
 * used to score candidate matches.
 */
export default function Footer(): React.JSX.Element {
  const breakdownText =
    'How a score is built: ' +
    Object.entries(WEIGHTS)
      .map(([key, val]) => `${key} ${val}%`)
      .join(', ') +
    '. Different categories cap the score at 40%.';

  return (
    <footer>
      <div className="wrap" id="weights">
        {breakdownText}
      </div>
    </footer>
  );
}
