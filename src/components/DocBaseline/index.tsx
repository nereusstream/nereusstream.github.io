import React from 'react';

type DocBaselineProps = {
  commit: string;
  verified: string;
  source?: string;
};

export default function DocBaseline({commit, verified, source = 'nereusstream/nereus'}: DocBaselineProps) {
  return (
    <div className="doc-baseline" role="note">
      <span className="doc-baseline__label">Source baseline</span>
      <a href={`https://github.com/${source}/tree/${commit}`}><code>{commit.slice(0, 12)}</code></a>
      <span>·</span>
      <span>verified {verified}</span>
    </div>
  );
}
