---
title: Project status
description: Current source, documentation, and verification status for the public Nereus site.
sidebar_position: 1
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Project status {#project-status}

## Current implementation baseline {#implementation-baseline}

| Item | Current value |
| --- | --- |
| Nereus source | `main@c820391dc1de4229362ddf833487066c32609cba` |
| Architecture PDF source | `main@894fc4e4d9afcfd5ec14c2bde336106b85c2a151` |
| Verification date | 2026-08-07 |
| Release posture | `v0.1.0` testing; no final release claim |
| Public site stage | English architecture/documentation tree migrated to Docusaurus; translation remains deferred |

The source advanced after the PDF snapshot with a Kafka retention test change that waits for close/drain completion and asserts the active count reaches zero. It does not change the architecture model, but the current source commit is recorded separately so readers do not mistake the PDF's historical commit for today's checkout.

## Documentation migration status {#documentation-migration-status}

| Stage | Scope | Status |
| --- | --- | --- |
| Framework | Docusaurus 3.10.2, TypeScript, Mermaid, Pages workflow | Implemented |
| Homepage | Stable project entry, architecture summary, invariants, profiles, status | Implemented |
| Overview | Why Nereus, architecture, reading guide | Implemented |
| Concepts | Coordinates, WAL, head/CAS, read targets | Implemented |
| Write/read paths | Append flow/outcomes/recovery, read resolution/boundaries/repair | Implemented for the migrated core contract |
| Storage evolution | Profiles, Object/BK WAL, generations, materialization | Implemented for the migrated core contract |
| Integrations | Pulsar facade/cursors, Native Kafka, KoP boundary | Implemented for the migrated integration contract |
| Operations/reference | Trim/retention/GC, failure, backpressure, observability, security, correctness, module boundaries, examples, glossary, state machines, cheatsheet, source map | Implemented |
| Chinese locale | Full translated document tree | Deferred until the English route is usable |

The authoritative coverage table is [`migration/pdf-content-map.yml`](https://github.com/nereusstream/nereusstream.github.io/blob/master/migration/pdf-content-map.yml). It records the PDF snapshot, the current source commit, and the page targets for the migrated English tree. A future translated tree or a refreshed PDF snapshot must use a new verification date and source comparison.

## Verification gates {#verification-gates}

Every milestone must pass:

- `yarn typecheck`
- `yarn build`
- `git diff --check`
- a review of source baseline, current status, and coverage-map changes together

The GitHub Pages workflow builds pull requests but deploys only on a push to `master`.
