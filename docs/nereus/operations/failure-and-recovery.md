---
title: Failure and recovery
description: Recovery behavior at append, read, materialization, trim, and physical-delete cut points.
sidebar_position: 4
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Failure and recovery {#failure-and-recovery}

Reliability comes from leaving one durable, exact interpretation after each failure—not from the
happy-path sequence alone. Recovery always compares identity, version, checksum, owner/session, and
authority before treating a response loss as an idempotent success.

## Append cut points {#append-cut-points}

| Cut point | Durable state | Recovery result |
| --- | --- | --- |
| Before primary WAL I/O | No provider bytes, intent, or head change | `KNOWN_NOT_COMMITTED`; a new attempt is safe |
| WAL partial/uncertain | Physical bytes may exist; head is unchanged | Reuse exact Object identity or taint/seal BK ledger; never guess a new offset |
| WAL durable, before intent | Bytes/root/reservation may exist; head unchanged | Reuse exact attempt or let unreferenced bytes enter orphan grace |
| Intent/protection, before head CAS | Durable pending evidence; logical range not visible | Reuse same intent/target; retire protection if proven uncommitted |
| Head CAS condition fails | Head did not advance for this attempt | Treat bytes as uncommitted and preserve exact evidence for recovery/GC |
| Head CAS response unknown | Head may or may not have advanced | `MAY_HAVE_COMMITTED`; suspend the stream lane and resolve original attempt |
| Head committed, index fails | Logical range is committed; generation 0 may be missing | `KNOWN_COMMITTED`; repair index from reachable commit evidence |
| Head committed, required Object generation fails | Logical range is committed and generation 0 is readable | Reuse deterministic materialization task/output; never rewrite primary WAL |

An unknown client timeout is not permission to issue a second append. The original attempt remains the
recovery handle until the head and reachable commit chain prove committed or proven-not-committed.

## Stale writers and takeover {#stale-writers}

Pulsar takeover obtains a new append session and cursor owner session. Kafka binds the append authority
to the KRaft leader epoch. An old owner can remain blocked in provider I/O, but guarded upload,
session revalidation, and head CAS fence its completion. Physical bytes written by a stale writer do
not advance LEO or the Nereus head.

## Read failures {#read-failures}

- A missing index inside `[trimOffset, committedEndOffset)` triggers bounded repair, not EOF.
- A lost watch invalidates a cache hint; read-through scan and version revalidation remain correct.
- An expired target pin invalidates the positive cache entry and performs a fresh resolve.
- A higher-generation provider failure receives bounded retries before same-view fallback.
- A permanently missing or checksum-invalid target is quarantined by exact identity; the resolver tries
  a healthy same-view candidate or returns an error rather than skipping data.
- A reader racing GC pins and revalidates before reading. A `MARKED` root cannot accept a new lease;
  leases established before mark must drain.

## Materialization failures {#materialization-failures}

Task creation, protection creation, and Object PUT response loss are resolved by reloading the exact
key, value/version, root, metadata, CRC, and full SHA. Staging files are disposable; a new worker
recomputes from the durable task and source set. A `PREPARED` generation remains invisible until the
publisher either commits the same exact record or aborts it. If the `COMMITTED` CAS response is lost,
reloading the exact winner is success and does not allocate a second generation.

Task cleanup is task-first and plan-second: verify the committed generation, output root, checkpoint,
and protections before deleting workflow metadata.

## Trim and physical delete failures {#trim-delete}

Trim CAS before application leaves the offset unchanged; a response-loss retry reloads the current
trim and treats the same target as success. Physical bytes remaining after trim are normal.

For GC, a fresh scanner rebuilds `MARKED` evidence; a `DELETING` root resumes from its sealed journal.
Object DELETE and root-CAS response loss is resolved by exact absence/root reload. A late object under a
deleted key receives a new lifecycle root and orphan grace. BookKeeper deletion needs delayed
double-absence and preserves a late-create hazard veto.

## Exact identity checklist {#exact-identity}

Every response-loss recovery compares the relevant subset of:

- stream, partition, and half-open range;
- commit, task, publication, or delete ID;
- physical target identity and root lifecycle epoch;
- metadata version and checksum domains;
- owner/session/leader authority;
- policy and source-set digest.

“A similar object, task, or ledger exists” is not recovery evidence.

## Source anchors {#source-anchors}

- [`AppendCoordinator.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/AppendCoordinator.java)
- [`MaterializationTaskRecovery.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/MaterializationTaskRecovery.java)
- [`KafkaPartitionRecoveryCoordinator.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter/src/main/java/com/nereusstream/kafka/recovery/KafkaPartitionRecoveryCoordinator.java)
- [`Overall architecture contracts`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-overall-architecture.md)
