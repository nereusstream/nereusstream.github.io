import fs from 'node:fs';
import {absolutePath, collectMapTargets, readYaml, walkFiles, assertCondition, finishCheck} from './contract-utils.mjs';

const errors = [];
const products = [
  {
    id: 'nereus',
    prefix: 'docs/nereus',
    map: 'migration/nereus/pdf-content-map.yml',
    lock: 'migration/product-source-locks.yml',
  },
  {
    id: 'nereus-delay',
    prefix: 'docs/nereus-delay',
    map: 'migration/nereus-delay/content-map.yml',
    lock: 'migration/product-source-locks.yml',
  },
];

const locks = readYaml('migration/product-source-locks.yml').products ?? {};

for (const product of products) {
  const map = readYaml(product.map);
  const lock = locks[product.id];
  const targets = collectMapTargets(map, product.prefix);
  const docs = new Set(walkFiles(product.prefix));

  assertCondition(Boolean(lock), `${product.map}: missing source lock for ${product.id}`, errors);
  assertCondition(map.source?.current_source_commit === undefined || map.source.current_source_commit === lock?.commit, `${product.map}: current_source_commit does not match source lock`, errors);
  assertCondition(map.source?.commit === lock?.commit || map.source?.current_source_commit === lock?.commit, `${product.map}: map source commit does not match source lock`, errors);
  assertCondition(map.source?.verified === lock?.verified || map.source?.current_source_verified === lock?.verified, `${product.map}: map verification date does not match source lock`, errors);

  for (const target of targets) {
    assertCondition(fs.existsSync(absolutePath(target)), `${product.map}: target does not exist: ${target}`, errors);
    assertCondition(docs.has(target), `${product.map}: target is outside the product docs tree: ${target}`, errors);
  }
  for (const doc of docs) {
    assertCondition(targets.has(doc), `${product.map}: document is not mapped: ${doc}`, errors);
  }

  if (product.id === 'nereus') {
    for (const key of ['unmapped_sections', 'unmapped_figures', 'unmapped_tables']) {
      assertCondition(Array.isArray(map[key]) && map[key].length === 0, `${product.map}: ${key} must be empty`, errors);
    }
  }
}

finishCheck('verify-content-maps', errors);
