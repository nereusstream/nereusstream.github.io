import {readText, walkFiles, docRoute, assertCondition, finishCheck} from './contract-utils.mjs';

const errors = [];
const redirectSource = readText('migration/legacy-redirects.ts');
const idsBlock = redirectSource.match(/const nereusDocIds = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const ids = [...idsBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
const uniqueIds = new Set(ids);
const expected = [
  {
    from: '/docs/category/overview/',
    to: '/docs/nereus/category/overview/',
  },
  ...ids.map((id) => ({from: `/docs/${id}/`, to: `/docs/nereus/${id}/`})),
];

assertCondition(ids.length > 0, 'migration/legacy-redirects.ts: no Nereus document IDs found', errors);
assertCondition(uniqueIds.size === ids.length, 'migration/legacy-redirects.ts: duplicate Nereus document ID', errors);

const literalRedirects = [...redirectSource.matchAll(/\{\s*from: '([^']+)',\s*to: '([^']+)'\s*,?\s*\}/g)].map((match) => ({
  from: match[1],
  to: match[2],
}));
assertCondition(literalRedirects.some((redirect) => redirect.from === expected[0].from && redirect.to === expected[0].to), 'legacy redirect category mapping is missing', errors);

const canonicalRoutes = new Set(walkFiles('docs/nereus').map(docRoute));
canonicalRoutes.add('/docs/nereus/category/overview/');
for (const redirect of expected) {
  assertCondition(canonicalRoutes.has(redirect.to), `legacy redirect target is not canonical: ${redirect.to}`, errors);
  assertCondition(!canonicalRoutes.has(redirect.from), `canonical route is used as a legacy redirect source: ${redirect.from}`, errors);
}

const expectedFrom = new Set(expected.map((redirect) => redirect.from));
const expectedTo = new Set(expected.map((redirect) => redirect.to));
assertCondition(expectedFrom.size === expected.length, 'legacy redirect source paths are not unique', errors);
for (const source of expectedFrom) {
  assertCondition(!expectedTo.has(source), `legacy redirect chain detected at ${source}`, errors);
}

const internalLinkPattern = /(?:\]\(|(?:to|href)=['"])(\/docs\/[^)\s'"]*)/g;
for (const root of ['docs/nereus', 'docs/nereus-delay', 'src']) {
  const files = root === 'src' ? walkFiles(root, new Set(['.tsx', '.ts', '.md', '.mdx'])) : walkFiles(root);
  for (const file of files) {
    const contents = readText(file);
    for (const [, route] of contents.matchAll(internalLinkPattern)) {
      const normalized = route.endsWith('/') ? route : route;
      const isDocsHub = normalized === '/docs/' || normalized.startsWith('/docs/?') || normalized.startsWith('/docs#');
      const isCanonicalProductDocs = normalized.startsWith('/docs/nereus/');
      assertCondition(isDocsHub || isCanonicalProductDocs, `${file}: stale internal docs route ${route}`, errors);
    }
  }
}

finishCheck('verify-legacy-redirects', errors);
