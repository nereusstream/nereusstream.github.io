---
title: Project status
description: Current Nereus Delay implementation baseline, source evidence, and release blockers.
sidebar_position: 1
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - README.md
  - docs/IMPLEMENTATION-STATUS.md
  - docs/V1-DESIGN-AUDIT.md
last_verified: 2026-08-07
status: current-main
authority: implementation-status
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Project status {#project-status}

## Public baseline {#public-baseline}

| Item | Current value |
| --- | --- |
| Product source | `main@9281890f42772cc01b6b2b607fd93e31de64879b` |
| Spec revision | `V1-FROZEN-2026-08-01` |
| Verification date | 2026-08-07 |
| Public posture | `V1 in development` |
| Website authority | Reader-facing summary pinned to the source commit above |

The implementation-status source reports substantial local progress across protocol codecs, deterministic Shard Runtime behavior, RocksDB projections, scheduler state, payload reservation/commit, and typed outcome boundaries. Those entries are evidence for the named local scope only.

## Remaining release blockers {#remaining-release-blockers}

The public site must continue to show these blockers:

- concrete pinned Kafka/Pulsar ingress and destination transports with authenticated non-persistence and publish evidence;
- production Oxia session, Owner Lease, checkpoint catalog, Recovery Pin, and activation CAS authority;
- external Object Store and Broker ownership/quiescence evidence;
- complete large-payload, quota, control reserve, Lane terminal-guard, and guarded GC orchestration;
- real-service integration, failure-cut, chaos, benchmark, soak, upgrade, and release-runbook evidence.

The V1 Design Audit is a cross-document audit view and the Implementation Status document is the current code/evidence view. Neither replaces the normative design or Registry. A release claim is valid only after the design's release artifact matrix and all release gates are complete.

## Public reading path coverage {#public-reading-path-coverage}

The public documentation now exposes the core decision path in separate pages:

- time semantics: `deliverAt`, `actionAt`, `expireAt`, and the Trusted UTC interval;
- command semantics: Command, message, receipt, Source Position, Shard Log, and ACK-after-sync;
- delivery mode and guarantee boundaries: `MANAGED`, `AUTO_FAST`, at-least-once, and `UNCERTAIN`;
- lifecycle operations: Schedule, Cancel, Reschedule, Query, and the Query Barrier.

These pages are reader-facing summaries pinned to the same source baseline above. The design document, Protocol Registry, ADRs, and implementation-status evidence remain authoritative for exact wire fields, preconditions, and release claims.

## Source links {#source-links}

- [`IMPLEMENTATION-STATUS.md`](https://github.com/nereusstream/nereus-delay/blob/9281890f42772cc01b6b2b607fd93e31de64879b/docs/IMPLEMENTATION-STATUS.md)
- [`V1-DESIGN-AUDIT.md`](https://github.com/nereusstream/nereus-delay/blob/9281890f42772cc01b6b2b607fd93e31de64879b/docs/V1-DESIGN-AUDIT.md)
- [`Nereus Delay V1 设计.md`](https://github.com/nereusstream/nereus-delay/blob/9281890f42772cc01b6b2b607fd93e31de64879b/docs/Nereus%20Delay%20V1%20%E8%AE%BE%E8%AE%A1.md)
