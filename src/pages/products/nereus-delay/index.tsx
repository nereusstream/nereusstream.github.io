import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import {getProduct} from '../../../data/products';
import styles from '../ProductEntry.module.css';

const product = getProduct('nereus-delay');

function NereusDelayEntryPage() {
  return (
    <Layout title="Nereus Delay | NereusStream" description={product.summary}>
      <main className={styles.page}>
        <div className="container">
          <div className={styles.copy}>
            <p className={styles.status}>{product.statusLabel}</p>
            <h1>{product.name}</h1>
            <p className={styles.summary}>{product.summary}</p>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.actions}>
              <Link className={clsx('button button--primary', styles.primary)} to="/">
                NereusStream home <span aria-hidden="true">→</span>
              </Link>
              <a className={clsx('button button--outline', styles.secondary)} href={product.repositoryUrl}>
                View source <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default NereusDelayEntryPage;
