---
title: Document baseline and source ownership
description: How the public site relates to the architecture PDF and implementation repositories.
sidebar_position: 2
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Document baseline and source ownership {#document-baseline}

## Two commits, two roles {#two-commits}

The supplied PDF is a migration source snapshot generated from `nereusstream/nereus main@894fc4e4`. The current implementation checkout is `main@c820391d`, verified on 2026-08-07. The website records both because a source snapshot is not automatically current merely because it is detailed.

When a page contains a claim that can drift, it must use the current implementation commit or explicitly label the claim as historical PDF baseline. A test-only source advance can leave architecture text unchanged, but the distinction remains visible in the status page and coverage map.

## Ownership model {#ownership-model}

| Content | Maintained in |
| --- | --- |
| Public architecture, concepts, flows, and operations | This website repository (`Markdown/MDX`) |
| Class-level contracts and implementation plans | `nereus` source repository |
| Architecture PDF | A release snapshot generated from website Markdown/MDX after migration completes |
| Current status and verification facts | `src/data/projectStatus.ts` and the project-status page |
| Source anchors | Exact commit links in each page |

The supplied PDF remains an input snapshot during migration. It is not treated as a second hand-maintained website source.

## Machine-readable page contract {#machine-readable-page-contract}

Every Nereus and Nereus Delay page records its product, source repository, full source commit, verification date, status, and authority in frontmatter. The `DocBaseline` banner renders the product, short commit, verification date, and authority while linking the short commit to the full source SHA. `yarn docs:check` verifies those fields against `migration/product-source-locks.yml`, so a page cannot silently drift to a different product baseline.

## Coverage contract {#coverage-contract}

The migration map records every PDF chapter, appendix, figure, and table. A section can be `migrated`, `in-progress`, or `pending`; a pending item must not be silently omitted. Completion requires the map to have no unmapped sections or figures and the generated site to pass broken-link checks.

## Non-goals for this stage {#non-goals}

- No multi-version Docusaurus tree before `v0.1.0` is released.
- No locale dropdown before the Chinese route is complete enough to be useful.
- No temporary search plugin before the documentation corpus reaches the planned size.
- No new Quickstart promise derived only from an architecture PDF.
