---
title: Primary WAL
description: The role of the primary write-ahead log and its relationship to commit visibility.
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

# Primary WAL {#primary-wal}

## What problem does it solve? {#problem}

The storage core needs a durable representation before it can recover from a broker crash or an uncertain client response. The primary WAL is that first durable representation for a profile. It may be BookKeeper or an immutable Object WAL.

## Durable is not committed {#durable-is-not-committed}

A successful WAL operation proves that bytes exist under a physical identity. It does **not** by itself prove that the logical offset is visible to readers. Logical visibility is published by the stream-head commit protocol.

```text
WAL durable  ≠  offset committed
object PUT   ≠  generation published
```

This distinction is the basis for recovery after a crash between provider I/O and metadata publication.

## Object WAL {#object-wal}

Object WAL uses immutable objects. An object may contain slices for multiple streams, so its manifest, root identity, byte range, checksum, and stream slice must be tracked independently. Multi-stream packing improves physical layout but makes exact reference tracking essential for GC.

## BookKeeper WAL {#bookkeeper-wal}

The Nereus BookKeeper WAL uses a per-stream ledger boundary rather than treating a stock ManagedLedger ledger as the logical stream identity. A ledger may roll over; the logical stream and offsets remain continuous. Ranged entries let the Kafka adapter preserve a RecordBatch that covers multiple logical offsets.

## Profile-specific completion {#completion}

The primary WAL is common to all profiles, but the producer success boundary is not:

| Profile family | Primary WAL | Completion implication |
| --- | --- | --- |
| BookKeeper-only | BookKeeper | No message-data Object generation is required for the producer path. |
| Async object | BookKeeper or Object WAL | A stable WAL projection can be acknowledged before a read-optimized object exists. |
| Sync object | BookKeeper or Object WAL | The profile may require an additional visible/indexed object representation before success. |

The full five-profile matrix will be added in the storage migration stage.

## Source anchors {#source-anchors}

- [`docs/design/nereus-commit-protocol.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-commit-protocol.md)
- [`docs/design/nereus-storage-object-format.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-storage-object-format.md)
- [`docs/phase-bk-bookkeeper-primary-wal/README.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-bk-bookkeeper-primary-wal/README.md)
