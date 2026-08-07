import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import {products} from '../../data/products';
import styles from './index.module.css';

function DocsHub() {
  const nereus = products.find((product) => product.id === 'nereus');
  const nereusDelay = products.find((product) => product.id === 'nereus-delay');

  if (!nereus || !nereusDelay) {
    throw new Error('Docs Hub requires both NereusStream products');
  }

  return (
    <Layout title="Documentation | NereusStream" description="Choose a NereusStream product and follow its documentation.">
      <main>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>NereusStream</p>
            <h1>Documentation</h1>
            <p>Choose a product, then follow its concepts, architecture, operations, and reference material in the product&apos;s own reading order.</p>
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.grid}>
            <article className={clsx(styles.card, styles.cyan)}>
              <span className={styles.status}>{nereus.statusLabel}</span>
              <h2>{nereus.name}</h2>
              <p>{nereus.summary}</p>
              <small>Baseline verified {nereus.lastVerified}. Start with the architecture overview, then move through logical coordinates, commit, storage, integrations, and recovery.</small>
              <Link className={styles.link} to={nereus.docsPath}>Start with Nereus <span aria-hidden="true">→</span></Link>
            </article>
            <article className={clsx(styles.card, styles.indigo)}>
              <span className={styles.status}>{nereusDelay.statusLabel}</span>
              <h2>{nereusDelay.name}</h2>
              <p>{nereusDelay.summary}</p>
              <small>Baseline verified {nereusDelay.lastVerified}. Start with the architecture and timing boundaries, then read the command, lane, recovery, and status pages.</small>
              <Link className={styles.link} to={nereusDelay.docsPath}>Start with Nereus Delay <span aria-hidden="true">→</span></Link>
            </article>
          </div>

          <div className={styles.policy}>
            <p className={styles.kicker}>Source and documentation policy</p>
            <h2>Reader-facing explanations carry their product baseline.</h2>
            <p>The product repositories remain authoritative for implementation, normative design, protocol registries, ADRs, and release evidence. This site provides navigable explanations with an explicit source commit and verification date; it does not silently replace those authorities.</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default DocsHub;
