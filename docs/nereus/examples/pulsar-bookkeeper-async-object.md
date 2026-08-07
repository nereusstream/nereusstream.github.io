---
title: "Example: Pulsar with BookKeeper async Object"
description: A batched Pulsar Entry through BOOKKEEPER_WAL_ASYNC_OBJECT and later materialization.
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

# Example: Pulsar with BookKeeper async Object {#pulsar-bookkeeper-async-object}

This scenario shows why a Pulsar batch Entry remains one Nereus offset even when it contains ten
sub-messages.

## Initial state and mapping {#initial-state}

```text
streamId = S-payments-1
virtualLedgerId = V-9001
committedEndOffset = 1000
active BookKeeper ledger = 880
next BookKeeper entry = 200
```

The Entry contains ten batch messages, but the facade produces:

```text
AppendEntry.recordCount = 1
logical range = [1000,1001)
```

The ten Pulsar MessageIds differ by `batchIndex`; they do not consume ten stream offsets.

## BK append and immediate read {#bk-append}

1. The stream lane validates the session and expected offset.
2. Reservation confirms ledger `880` can hold the complete append.
3. The complete Entry is written as BookKeeper entry `200`.
4. Bookie quorum succeeds; range metadata and fixed protection slots are published.
5. Commit intent is written and head advances `1000 -> 1001`.
6. The async profile completes at the stable-head boundary.
7. Pulsar returns `Position(V-9001,1000)`.

Before objectization, generation 0 reads the exact target `(ledger=880, firstEntryId=200,
entryCount=1)`. Pulsar receives complete Entry bytes and applies batch decoding itself.

## Async materialization {#materialization}

The worker freezes exact generation-0 BK ranges, establishes dynamic source protection, reads the
ranges, writes a verified NCP1 Object, and publishes generation 1. Ordinary readers then prefer the
Object; while the BK source remains healthy, a physical Object failure can fall back to generation 0
in the same `COMMITTED` view.

## BK ledger retirement {#retirement}

Ledger `880` is not deleted when the Object appears. It must be sealed, every range must be trimmed or
covered by a healthy replacement, recovery checkpoint proof must exist, and reader/task/repair/cursor/
append-recovery references must be absent. Whole-ledger retention then marks, drains, deletes, and
performs delayed double-absence verification.

## Source anchors {#source-anchors}

- [`BookKeeperPrimaryWalRuntime.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-bookkeeper/src/main/java/com/nereusstream/bookkeeper/BookKeeperPrimaryWalRuntime.java)
- [`BookKeeper range target`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-bookkeeper/src/main/java/com/nereusstream/bookkeeper/BookKeeperRangedEntryCodecV1.java)
- [`BookKeeper retention`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-bookkeeper/src/main/java/com/nereusstream/bookkeeper/BookKeeperLedgerRetentionService.java)
