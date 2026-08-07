import React from 'react';

type DocBaselineProps = {
  product?: string;
  repository?: string;
  commit: string;
  verified: string;
  authority?: string;
  source?: string;
};

export default function DocBaseline({
  product,
  repository,
  commit,
  verified,
  authority = 'reader-facing-summary',
  source,
}: DocBaselineProps) {
  const resolvedRepository = repository ?? source ?? 'nereusstream/nereus';
  const resolvedProduct = product ?? (resolvedRepository === 'nereusstream/nereus-delay' ? 'Nereus Delay' : 'Nereus');

  return (
    <div className="doc-baseline" role="note">
      <span className="doc-baseline__label">Source baseline</span>
      <strong>{resolvedProduct}</strong>
      <a
        href={`https://github.com/${resolvedRepository}/tree/${commit}`}
        aria-label={`${resolvedProduct} source commit ${commit}`}>
        commit <code>{commit.slice(0, 12)}</code>
      </a>
      <span>·</span>
      <span>verified {verified}</span>
      <span>·</span>
      <span>authority {authority}</span>
    </div>
  );
}
