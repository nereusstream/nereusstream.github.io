---
title: BookKeeper WAL
description: Nereus BookKeeper ledger ownership, ranged entries, rollover, and delete safety.
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

# BookKeeper WAL {#bookkeeper-wal}

## Why it is a Nereus provider {#provider-boundary}

The BookKeeper WAL uses the public BookKeeper client API but keeps Nereus stream head, `ReadTarget`, generation, and retention semantics in Nereus metadata. It does not make a stock `ManagedLedger` ledger the core logical truth.

Nereus maintains ledger allocation intent, root lifecycle, stream writer state, append reservations, exact entry ranges, range protection, reader slots, and retention state.

## Ledger ownership {#ledger-ownership}

An active writable ledger belongs to one stream/session epoch and is not shared across Nereus streams. This lets whole-ledger retention reason about one stream's history instead of copying unrelated slices out of a shared ledger.

## Ranged entries {#ranged-entries}

`BookKeeperEntryRangeReadTarget` records a cluster alias, ledger ID, first entry ID, entry count, mapping, and range checksum. One Nereus append batch uses a contiguous range and does not cross a ledger boundary:

- Pulsar complete Entry → one BK entry and `recordCount = 1`;
- Kafka complete RecordBatch → one BK entry and `recordCount` may cover several logical offsets.

Therefore “one Nereus offset equals one BK entry” is only true for the single-record mapping. The stable statement is: one append entry maps to one complete BookKeeper entry, and that entry may cover one or more logical offsets.

## Rollover and taint {#rollover}

If the current ledger cannot contain the next append, Nereus seals it and creates a new one. An append is never split across two ledgers. Uncertain create results, partial writes, ownership changes, or stale completions taint a ledger and prevent unsafe tail reuse.

Normal reads use non-recovery open. Recovery-open is restricted to owner recovery and fencing because it may close the ledger and change physical facts such as LAC.

## Reserved ledger ID namespace {#reserved-namespace}

BookKeeper delete is not a versioned conditional operation. If another system can later create the same ledger ID, a stale delete can remove a different physical ledger (an ABA hazard). Nereus requires a precise, verifiable reserved positive 63-bit namespace and persists its reservation/capability proof. Without proof, first-create and physical delete are rejected.

## Source anchors {#source-anchors}

- [`BookKeeperEntryRangeReadTarget.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/target/BookKeeperEntryRangeReadTarget.java)
- [`nereus-bookkeeper`](https://github.com/nereusstream/nereus/tree/c820391dc1de4229362ddf833487066c32609cba/nereus-bookkeeper)
- [`docs/phase-bk-bookkeeper-primary-wal/README.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-bk-bookkeeper-primary-wal/README.md)
