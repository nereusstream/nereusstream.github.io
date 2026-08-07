---
title: BookKeeper retention
description: Whole-ledger retirement rules, late-create hazards, and recovery-safe deletion.
sidebar_position: 3
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# BookKeeper retention {#bookkeeper-retention}

BookKeeper does not support deleting an individual entry. Nereus therefore retires and deletes an
entire ledger only after proving that every range in it is safe.

## Whole-ledger eligibility {#eligibility}

Before deletion, the ledger must be:

- `SEALED`, with no writer still using it;
- fully covered by logical trim, healthy replacement, or source-retirement proofs for every append
  range;
- free of reader slots and BookKeeper read leases;
- free of task, repair, append-recovery, cursor, and checkpoint protections;
- covered by matching reserved namespace, provider scope, activation, and Broker readiness facts;
- stable across two complete inventory captures with no reference drift.

The retention manager cannot infer safety from a stream’s trim alone because one ledger may contain
multiple stream slices and ranges owned by different reference domains.

## Ledger lifecycle {#ledger-lifecycle}

```text
SEALED
  -> MARKED
  -> reader/protection drain
  -> provider delete
  -> response-loss recovery
  -> delayed first absence
  -> delayed second absence
  -> DELETED
```

If ledger creation once had an uncertain outcome and left a `lateCreateHazard`, automatic deletion is
permanently vetoed for that identity. The runtime must not turn a single `NoSuchLedger` response into
proof that a late-created foreign or matching ledger cannot appear.

## Recovery and protection rules {#recovery}

Normal reads open a validated target; recovery paths are the only paths allowed to inspect a tainted
or uncertain ledger. A fixed protection slot, exact ledger identity, cluster alias, and lifecycle
epoch distinguish the intended ledger from an ABA reuse. Delete/recreate therefore allocates a fresh
identity and never reuses a deleted ledger’s target as if it were the old source.

If a delete response is lost, a fresh runtime performs non-recovery existence checks and delayed
double-absence verification. It keeps the durable root/journal until the proof converges.

## Source anchors {#source-anchors}

- [`BookKeeper retention module`](https://github.com/nereusstream/nereus/tree/c820391dc1de4229362ddf833487066c32609cba/nereus-bookkeeper)
- [`BookKeeper primary WAL contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-bk-bookkeeper-primary-wal/05-retention-materialization-and-completion.md)
- [`BookKeeper recovery and fencing`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-bk-bookkeeper-primary-wal/04-append-read-recovery-and-fencing.md)
