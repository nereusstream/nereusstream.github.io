---
title: "Example: Pulsar with Object WAL sync"
description: An end-to-end ordinary Pulsar Entry through OBJECT_WAL_SYNC_OBJECT.
sidebar_position: 1
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Example: Pulsar with Object WAL sync {#pulsar-object-wal-sync}

This example follows one ordinary Pulsar Entry in `OBJECT_WAL_SYNC_OBJECT`. The numbers are a
worked scenario, not a benchmark or a promise of default deployment values.

## Initial state {#initial-state}

| Fact | Value |
| --- | --- |
| Topic | `persistent://tenant/ns/orders-partition-0` |
| Projection incarnation | `1` |
| Stream | `S-orders-1` |
| Virtual ledger | `V-7001` |
| Committed end | `50` |
| Commit version | `20` |
| Trim offset | `0` |

The producer sends one complete Entry.

## Append {#append}

1. Pulsar performs protocol checks and calls `ManagedLedger.addEntry`.
2. The facade wraps the complete bytes as `AppendEntry(recordCount=1)` for `[50,51)`.
3. Profile/capability admission verifies the Object WAL writer, reader, generation protocol, and
   runtime readiness.
4. The stream lane obtains the current append session and expected offset `50`.
5. Object WAL writes the Entry into an immutable multi-stream object slice.
6. Object PUT is verified by length, CRC, and metadata.
7. Manifest and physical root are published; the append protection is established.
8. The deterministic commit intent is written.
9. Head CAS advances end `50 -> 51`, commit version `20 -> 21`, and records the commit ID.
10. The sync profile confirms generation-0 index/readability.
11. Nereus returns `AppendResult(range=[50,51), generation=0)`.
12. The facade returns `Position(V-7001, 50)`.

The Position comes from projection plus logical offset. It does not expose the Object key or slice
location.

## Read {#read}

The consumer Position is mapped back to `S-orders-1` offset `50`. The resolver checks head and trim,
selects generation 0 in `COMMITTED`, pins and revalidates the Object root/index, and reads the
complete Entry bytes. Pulsar then decodes metadata, compression, and any batch index.

## Higher generation {#higher-generation}

Materialization can publish a lossless NCP1 generation 1 for `[0,100)`. After its index CAS is
`COMMITTED`, a new read prefers generation 1 while the Position remains `(V-7001,50)`. If generation 1
is unavailable, fallback remains within the same `COMMITTED` view and the generation-0 Object target
is still selected if healthy.

## When the old Object WAL can be deleted {#deletion}

The original Object is eligible only after generation 1 is healthy, a recovery checkpoint covers the
old commit prefix, all reader/task/cursor protections drain, trim or replacement proof retires every
live slice, and other streams in the same Object no longer reference it. The physical root then
passes `MARKED -> DELETING -> DELETED`; object listing alone is not enough.

## Source anchors {#source-anchors}

- [`NereusManagedLedger.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-managed-ledger/src/main/java/com/nereusstream/managedledger/NereusManagedLedger.java)
- [`Storage profiles`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/StorageProfile.java)
- [`Object WAL contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-storage-object-format.md)
