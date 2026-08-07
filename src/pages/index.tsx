import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import {products} from '../data/products';
import styles from './index.module.css';

const principles = [
  {
    number: '01',
    title: 'Protocol-aware',
    body: 'Work with Kafka and Pulsar semantics instead of hiding their boundaries.',
  },
  {
    number: '02',
    title: 'Explicit correctness boundaries',
    body: 'Distinguish durable writes, logical commits, queued commands, applied state, and uncertain outcomes.',
  },
  {
    number: '03',
    title: 'Recoverable state',
    body: 'Design recovery, replay, checkpoints, retention, and cleanup as first-class paths.',
  },
];

function OrganizationMark() {
  return (
    <div className={styles.mark} aria-label="NereusStream product map">
      <div className={styles.markCore}>NereusStream</div>
      <div className={clsx(styles.markNode, styles.markNodeTop)}>Nereus</div>
      <div className={clsx(styles.markNode, styles.markNodeBottom)}>Delay</div>
      <span className={clsx(styles.markLine, styles.markLineTop)} aria-hidden="true" />
      <span className={clsx(styles.markLine, styles.markLineBottom)} aria-hidden="true" />
    </div>
  );
}

function ProductCard({product}: {product: (typeof products)[number]}) {
  return (
    <article className={clsx(styles.productCard, product.featured && styles.productCardFeatured, styles[`product-${product.accent}`])}>
      <div className={styles.cardHeader}>
        <span className={styles.statusBadge}>{product.statusLabel}</span>
        <span className={styles.cardIndex}>{product.featured ? '01' : '02'}</span>
      </div>
      <h3>{product.name}</h3>
      <p className={styles.productSummary}>{product.summary}</p>
      <p className={styles.productDescription}>{product.description}</p>
      <div className={styles.cardActions}>
        <Link className={styles.textLink} to={product.productPath}>Explore {product.name} <span aria-hidden="true">→</span></Link>
        <Link className={styles.textLink} to={product.docsPath}>Read docs <span aria-hidden="true">↗</span></Link>
        <a className={styles.textLink} href={product.repositoryUrl}>GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}

function Home() {
  return (
    <Layout title="NereusStream" description="Infrastructure for durable streams and scheduled delivery.">
      <main>
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroGrid)}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> NereusStream</p>
              <h1>Infrastructure for durable streams and scheduled delivery.</h1>
              <p className={styles.heroBody}>
                NereusStream builds infrastructure for Apache Pulsar and Apache Kafka—from shared stream storage to durable delayed-message scheduling.
              </p>
              <div className={styles.heroActions}>
                <a className={clsx('button button--primary', styles.primaryButton)} href="#products">
                  Explore products <span aria-hidden="true">↓</span>
                </a>
                <a className={clsx('button button--outline', styles.secondaryButton)} href="https://github.com/nereusstream">
                  View on GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <OrganizationMark />
            </div>
          </div>
        </section>

        <section id="products" className={clsx('container', styles.section)}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>Products</p>
            <h2>Two products, one infrastructure perspective.</h2>
            <p>Explore the flagship storage core and the durable scheduling system as separate products with independent source baselines and documentation.</p>
          </div>
          <div className={styles.productGrid}>
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className={styles.principlesSection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionKicker}>Organization principles</p>
              <h2>Make boundaries visible.</h2>
            </div>
            <div className={styles.principlesGrid}>
              {principles.map((principle) => (
                <article className={styles.principleCard} key={principle.number}>
                  <span>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.sectionIntroInline}>
            <div>
              <p className={styles.sectionKicker}>Documentation</p>
              <h2>Start from the product you need.</h2>
              <p>Each product has its own reading order, source baseline, and correctness boundaries.</p>
            </div>
            <Link className={clsx('button button--primary', styles.primaryButtonLight)} to="/docs">Browse documentation <span aria-hidden="true">→</span></Link>
          </div>
          <div className={styles.docsGrid}>
            <Link className={styles.docsCard} to="/docs"><span className={styles.docsCardKicker}>Nereus · v0.1.0 testing</span><strong>Shared stream storage</strong><small>Architecture, logical coordinates, write/read paths, storage profiles, and recovery.</small></Link>
            <Link className={styles.docsCard} to={products[1].docsPath}><span className={styles.docsCardKicker}>Nereus Delay · V1 in development</span><strong>Durable delayed delivery</strong><small>Timing semantics, command lifecycle, destination isolation, uncertainty, and checkpoints.</small></Link>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaPanel}>
              <div>
                <p className={styles.sectionKicker}>NereusStream</p>
                <h2>Build from durable boundaries.</h2>
                <p>Read the documentation or follow the organization repositories as each product moves toward its next verified baseline.</p>
              </div>
              <div className={styles.ctaActions}>
                <Link className={clsx('button button--primary', styles.primaryButton)} to="/docs">View documentation</Link>
                <a className={clsx('button button--outline', styles.secondaryButton)} href="https://github.com/nereusstream">Organization GitHub</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
