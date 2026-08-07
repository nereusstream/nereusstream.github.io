import {readText, readYaml, walkFiles, parseFrontmatter, fullCommitPattern, datePattern, assertCondition, finishCheck} from './contract-utils.mjs';

const errors = [];
const locks = readYaml('migration/product-source-locks.yml').products ?? {};
const productSource = readText('src/data/products.ts');
const productBlocks = [...productSource.matchAll(/\{\n\s+id: '([^']+)',([\s\S]*?)\n\s+\},/g)];

function field(block, name) {
  return block.match(new RegExp(`${name}: '([^']+)'`))?.[1];
}

for (const [, block] of productBlocks) {
  const id = block.match(/\{\n\s+id: '([^']+)'/)?.[1];
  if (!id) continue;
  const lock = locks[id];
  assertCondition(Boolean(lock), `src/data/products.ts: ${id} has no product source lock`, errors);
  if (!lock) continue;

  const commit = field(block, 'sourceCommit');
  const verified = field(block, 'lastVerified');
  const repositoryUrl = field(block, 'repositoryUrl');
  assertCondition(fullCommitPattern.test(commit ?? ''), `product ${id}: sourceCommit must be a full 40-character SHA`, errors);
  assertCondition(datePattern.test(verified ?? ''), `product ${id}: lastVerified must be YYYY-MM-DD`, errors);
  assertCondition(commit === lock.commit, `product ${id}: sourceCommit does not match product-source-locks.yml`, errors);
  assertCondition(verified === lock.verified, `product ${id}: lastVerified does not match product-source-locks.yml`, errors);
  assertCondition(repositoryUrl === `https://github.com/${lock.repository}`, `product ${id}: repositoryUrl does not match product-source-locks.yml`, errors);
}

for (const product of ['nereus', 'nereus-delay']) {
  const lock = locks[product];
  assertCondition(Boolean(lock), `missing source lock for ${product}`, errors);
  if (!lock) continue;

  for (const file of walkFiles(`docs/${product}`)) {
    let parsed;
    try {
      parsed = parseFrontmatter(file);
    } catch (error) {
      errors.push(error.message);
      continue;
    }

    const {data, body} = parsed;
    for (const key of ['product', 'source_repository', 'source_commit', 'last_verified', 'status', 'authority']) {
      assertCondition(data[key] !== undefined && data[key] !== '', `${file}: missing ${key}`, errors);
    }
    assertCondition(data.product === product, `${file}: product must be ${product}`, errors);
    assertCondition(data.source_repository === lock.repository, `${file}: source_repository does not match source lock`, errors);
    assertCondition(data.source_commit === lock.commit, `${file}: source_commit does not match source lock`, errors);
    assertCondition(fullCommitPattern.test(data.source_commit ?? ''), `${file}: source_commit must be a full 40-character SHA`, errors);
    assertCondition(data.last_verified === lock.verified && datePattern.test(data.last_verified ?? ''), `${file}: last_verified does not match source lock`, errors);
    if (product === 'nereus-delay') {
      assertCondition(Array.isArray(data.source_paths) && data.source_paths.length > 0, `${file}: Nereus Delay pages must declare source_paths`, errors);
      assertCondition(data.spec_revision === lock.spec_revision, `${file}: spec_revision does not match source lock`, errors);
    }

    const baseline = body.match(/<DocBaseline\b([^>]*)\/>/s)?.[1] ?? '';
    for (const attribute of ['product', 'repository', 'authority', 'commit', 'verified']) {
      assertCondition(new RegExp(`\\b${attribute}="`).test(baseline), `${file}: DocBaseline must declare ${attribute}`, errors);
    }
    assertCondition(baseline.includes(`repository="${lock.repository}"`), `${file}: DocBaseline repository does not match source lock`, errors);
    assertCondition(baseline.includes(`commit="${lock.commit}"`), `${file}: DocBaseline commit does not match source lock`, errors);
    assertCondition(baseline.includes(`verified="${lock.verified}"`), `${file}: DocBaseline verified date does not match source lock`, errors);
  }
}

finishCheck('verify-doc-baselines', errors);
