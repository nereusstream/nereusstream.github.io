---
title: Materialization
description: The background planner, task, worker, publication, and checkpoint contract.
sidebar_position: 7
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Materialization {#materialization}

Materialization turns exact committed source ranges into higher-generation physical representations.
It is a background data-plane workflow, not a second logical commit protocol. A task may prepare or
publish bytes, but only the generation-index CAS changes ordinary read selection.

## Discovery without ownership coupling {#discovery}

Materialization must also process cold or unloaded streams. A sharded stream registration is a
bounded discovery hint for scanners; it is not visibility truth and does not authorize deletion.
After finding a candidate stream, the scanner rereads authoritative projection/binding, head,
generation index, profile, task, and checkpoint state. Registration scans use fixed shards and bounded
pages instead of loading every stream into memory.

## Planner and durable task {#planner-task}

The planner considers committed generation indexes, policy, source size/count/age, trim state,
activation, registration, and existing work. It emits an immutable source set and target range with
bounded source count, record count, and metadata bytes. Source entries freeze stream, view, range,
generation, target identity, checksum, and index metadata version.

The durable task separates workflow progress from read visibility:

| State | Meaning |
| --- | --- |
| `PLANNED` | Source set and target policy are frozen |
| `CLAIMED` | A worker owns a versioned lease |
| `OUTPUT_READY` | Output passed format and identity verification |
| `PUBLISHING` | Final source/target/authority checks are in progress |
| `PUBLISHED` | Workflow reports publication, but the generation index remains the visibility authority |
| `RETRY_WAIT` | Retry is scheduled under a bounded policy |
| `FAILED` / `CANCELLED` | No reader selection; evidence remains for recovery/diagnosis |

Multiple workers claim by version-CAS and heartbeat a lease. A new worker reconstructs work from the
durable task, source identities, and object metadata; it does not reuse a dead process’s staging
handle.

## Source protection and exact reads {#source-protection}

Before reading, the worker creates durable protection for every source generation/Object/BK range.
Protection includes task identity, source generation, root lifecycle epoch, and identity checksum.
If a generation-0 BK anchor has already retired before dynamic protection can be created, the task
ends as `SOURCE_RETIRED` rather than retrying an impossible source forever.

Every source read revalidates:

- stream and read view;
- half-open range and generation;
- index key, metadata version, and index checksum;
- exact `ReadTarget` and physical checksum;
- source root health.

This prevents a planner snapshot from being mixed with bytes from a newer or different generation.

## Bounded staging and output identity {#staging-output}

Workers use backpressured source streams, a shared staging-byte budget, local spill files, sorted runs,
bounded fan-in, and (for semantic compaction) multiple passes. Staging files are process-local
resources, not recovery truth; close and cancel paths must return permits and remove them.

The output identity is based on exact content SHA-256 and a durable worker output-attempt ID. The
generation number is deliberately not part of the object key: a response-loss retry can reuse a
verified immutable output before a generation number is allocated. A key that has been physically
deleted is never reused, avoiding late-PUT resurrection.

## Guarded PUT and publication {#publication}

Before and after upload, the worker verifies owner/authority, physical-root permission, key identity,
declared and actual length, provider metadata/checksum, complete format, whole-file CRC/SHA, and source
lineage. If a PUT succeeded but the response was lost, exact HEAD plus full verification finds the
same output; the worker does not blindly write another key.

Publication then follows this order:

1. Allocate a positive generation.
2. Create a final index record in `PREPARED` state.
3. Revalidate source, output root, task owner, activation, and protection.
4. CAS `PREPARED -> COMMITTED` for the exact generation-index key.
5. Transfer output protection from the task owner to the committed-index owner.
6. Advance the advisory materialization checkpoint.
7. Release task-temporary protection.
8. Retire task metadata only after rereading the committed generation and all references.

Only step 4 changes normal read selection. A task marked `PUBLISHED` without that index CAS is not a
readable generation.

## Checkpoints {#checkpoints}

Two checkpoint classes have different authority:

| Checkpoint | Purpose | Can replace head/index truth? |
| --- | --- | --- |
| Materialization checkpoint | Reduce scanner/planner repetition and record progress | No; it is an advisory hint |
| Recovery checkpoint | Provide immutable proof sufficient to replace an old commit prefix during replay/index repair | It participates in retirement proof, but remains versioned and head-anchored |

Native Kafka adds NKC1 producer/transaction/segment/index state to accelerate partition open. No
checkpoint may lead the current head or become an alternate Kafka internal-topic authority.

## Close and drain {#close}

Runtime close stops new admission, permits at most one active pass plus one coalesced pending trigger,
and waits for accepted provider work to reach a determinate outcome within a shutdown deadline. At
the deadline, work is cancelled only through a recoverable path; completion must still be observed.
Close is a lifecycle boundary, not a way to abandon an accepted object upload or publication future.

## Source anchors {#source-anchors}

- [`DefaultMaterializationService.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/DefaultMaterializationService.java)
- [`ExactSourceSetVerifier.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/ExactSourceSetVerifier.java)
- [`DefaultGenerationCommitter.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/DefaultGenerationCommitter.java)
- [`Future 4 object format and domain API`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-4-compaction-generation/02-domain-api-and-object-format.md)
- [`Future 4 task recovery and checkpoint`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-4-compaction-generation/04-task-recovery-async-and-checkpoint.md)
