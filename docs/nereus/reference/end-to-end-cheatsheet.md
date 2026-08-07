---
title: End-to-end cheatsheet
description: One-page flow summaries for append, read, materialization, and retention/GC.
sidebar_position: 5
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# End-to-end cheatsheet {#end-to-end-cheatsheet}

Use the relevant authority and identity checks at every arrow. A provider response or workflow state
does not replace the conditional metadata boundary.

## Append {#append}

```text
protocol validation and encoding
  -> profile/capability admission
  -> per-stream lane
  -> append session/authority
  -> primary WAL durable
  -> provider metadata
  -> physical protection
  -> immutable commit intent
  -> stream head CAS
  -> profile completion boundary
  -> stable AppendResult
```

The head CAS is the logical commit point. Unknown completion reuses the original attempt; it is not a
new producer dedup key.

## Read {#read}

```text
protocol coordinate
  -> projection/binding
  -> consistent stream snapshot
  -> trim/end checks
  -> requested read view
  -> generation/index resolution
  -> generation-0 repair if needed
  -> reader pin/slot
  -> exact target revalidation
  -> physical reader
  -> boundary/limit handling
  -> protocol response
```

Fallback is same-view only. Trim, EOF, candidate failure, and checksum quarantine remain distinct
outcomes.

## Materialization {#materialization}

```text
registration discovery
  -> authoritative re-read
  -> planner freezes source/policy
  -> task claim and heartbeat
  -> source protection
  -> exact source read
  -> bounded staging/spill
  -> guarded Object PUT
  -> full verification
  -> PREPARED index
  -> final revalidation
  -> COMMITTED CAS
  -> protection transfer
  -> checkpoint and task cleanup
```

Only the generation-index CAS changes read selection.

## Retention and GC {#retention-gc}

```text
cursor ack or Kafka retention policy
  -> logical-trim permit
  -> trimOffset advance
  -> higher replacement/checkpoint proof
  -> source retirement
  -> root MARKED
  -> all-domain reference revalidation and reader drain
  -> DELETING journal
  -> physical DELETE
  -> response-loss recovery
  -> DELETED and delayed audit retirement
```

Object LIST is discovery only, and BookKeeper retention deletes whole sealed ledgers rather than
individual entries.

## Protocol projections {#protocol-projections}

| Protocol | Adapter-owned coordinate | Nereus-owned coordinate |
| --- | --- | --- |
| Pulsar | Position/MessageId, subscription, batch index | Stream offset, head, ReadTarget, cursor root |
| Native Kafka | RecordBatch, leader epoch, HW/LSO, transaction visibility | Ranged entry, stable head, generation, checkpoint |

## Source anchors {#source-anchors}

- [`Append flow`](../../data-paths/append-flow)
- [`Read flow`](../../data-paths/read-flow)
- [`Materialization`](../../storage/materialization)
- [`Retention, trim, and source retirement`](../../operations/retention-and-gc)
