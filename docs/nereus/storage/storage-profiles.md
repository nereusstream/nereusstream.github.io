---
title: Storage profiles
description: The five canonical persistence paths and their producer completion boundaries.
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

# Storage profiles {#storage-profiles}

## Storage class versus storage profile {#class-versus-profile}

These names describe two different decisions:

- **Storage class** is the protocol-facing choice between the stock BookKeeper ManagedLedger path and the Nereus ManagedLedger facade.
- **Storage profile** is the Nereus choice of primary WAL, objectization mode, and producer completion boundary after a stream enters Nereus.

The first decision binds a Pulsar Topic lifecycle. The second is durable stream metadata. Neither is an ad-hoc per-request switch.

## Two kinds of completion {#completion-model}

`DurabilityLevel` describes how far generation 0 must be confirmed:

- `WAL_DURABLE` still means primary WAL durable, recoverable commit intent, successful head CAS, and a stable offset. Generation-0 index repair may remain on the read path or background path.
- `WAL_DURABLE_AND_INDEX_COMMITTED` additionally requires generation-0 index and replay-marker confirmation.

`AppendCompletionPolicy` independently describes whether the producer must wait for a required higher Object generation. This is why “BK index visible” and “Object generation readable” are separate conditions.

## The five canonical profiles {#canonical-profiles}

| Profile | Primary WAL | Producer boundary | Later physical work |
| --- | --- | --- | --- |
| `OBJECT_WAL_SYNC_OBJECT` | Object Store | Stable head + generation-0 index | Optional higher read-optimized Object generation |
| `OBJECT_WAL_ASYNC_OBJECT` | Object Store | Stable head | Generation-0 repair and higher read-optimized generation in background |
| `BOOKKEEPER_WAL_ONLY` | BookKeeper | Stable head | No message-data Object generation |
| `BOOKKEEPER_WAL_ASYNC_OBJECT` | BookKeeper | Stable head, subject to materialization-lag admission | Background Object generation from exact committed BK ranges |
| `BOOKKEEPER_WAL_SYNC_OBJECT` | BookKeeper | Stable head + generation-0 index + verified required Object generation | Object completion happens before producer success |

`OBJECT_WAL` is a compatibility alias for `OBJECT_WAL_SYNC_OBJECT`; it is not a sixth path.

## Profile behavior {#profile-behavior}

### Object WAL sync {#object-sync}

The primary WAL is already an immutable Object WAL. The sync boundary confirms the generation-0 read path before success; it does not mean that a separate local WAL is copied to S3.

### Object WAL async {#object-async}

The Object WAL becomes durable and the head commits before producer success. Background work repairs indexes and generates read-optimized layouts. A reachable generation-0 target and protection keep read-after-ack recoverable.

### BookKeeper only {#bookkeeper-only}

BookKeeper is the primary and ordinary message-data read target. Object storage may still hold cursor snapshots or recovery checkpoints; “BK only” means no secondary message Object generation, not that the deployment has no Object Store.

### BookKeeper async object {#bookkeeper-async}

The producer can complete after BK durability and head CAS. A materialization worker later reads the exact committed BK range and publishes an Object generation. If lag admission is over the bound, new appends are rejected before BK I/O; existing commits remain readable from BK.

### BookKeeper sync object {#bookkeeper-sync}

Head CAS makes the data logically visible before the required Object generation is ready. A consumer may read BK while the producer waits. If the Object wait times out, the result is `KNOWN_COMMITTED`; recovery resumes the same append and task rather than writing BK again.

## Profile immutability {#immutability}

Changing the Broker default affects new streams only. Online profile migration would require barriers for old/new writers, historical target rules, rollout compatibility, and a new retention/GC authority. The current design does not provide that switch.

## Source anchors {#source-anchors}

- [`StorageProfile.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/StorageProfile.java)
- [`DurabilityLevel.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/DurabilityLevel.java)
- [`AppendCompletionPolicy.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/AppendCompletionPolicy.java)
- [`docs/phase-bk-bookkeeper-primary-wal/README.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-bk-bookkeeper-primary-wal/README.md)
