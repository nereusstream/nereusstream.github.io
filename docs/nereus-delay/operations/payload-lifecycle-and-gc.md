---
title: Payload lifecycle and guarded GC
description: Reserve, upload, attest, commit, and recover large payloads without breaking identity, retention, or late-write safety.
sidebar_position: 4
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0010-use-reserve-upload-commit-for-large-payloads.md
  - docs/adr/0011-tie-recovery-and-garbage-collection-to-a-checkpoint-floor.md
  - docs/adr/0040-use-ancestry-bound-recovery-lineages-and-pins.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Payload lifecycle and guarded GC {#payload-lifecycle-and-guarded-gc}

Inline payloads stay in the ordinary Schedule command. Large payloads use an explicit reservation protocol so that identity, quota, object ownership, source order, and recovery retention are visible at every boundary:

```text
PREPARE_LARGE_SCHEDULE
  -> PAYLOAD_RESERVED
  -> scoped upload handle
  -> immutable conditional upload
  -> attestation and PayloadCommitProof
  -> COMMIT_LARGE_SCHEDULE
  -> SCHEDULED generation 0
```

## 1. Reservation owns identity and capacity {#reservation}

`PREPARE_LARGE_SCHEDULE` is applied before an upload handle is issued. It pins the tenant/shard/message identity, Object Store Profile, service-owned object key, expected length and SHA-256, upload deadline, quota, and the activated payload-proof trust-set version. The `PayloadReservationReceipt` is a managed applied result, not proof that the payload bytes are already present.

The upload handle is a short-lived scoped capability. Callers cannot choose the bucket, key, endpoint, or credential. An exact existing object is idempotent after length/checksum verification; different bytes at the same identity are a conflict. Handles and presigned material are never stored in the Command, ordinary receipt, checkpoint, or public query projection.

Reservation expiration is a source-ordered overlay. A signed `TIME_FENCE_V1` that closes through `reservationExpiry` makes an uncommitted reservation logically expired immediately; the bounded expiry scanner only materializes that already-decided result. A worker wall clock or a half-completed scan cannot reopen it. Source Position decides a Cancel/Close versus Commit race.

## 2. Attestation precedes Commit {#attestation-and-commit}

After upload, the caller asks the service to attest the exact service-owned immutable object. The attestation checks object version/etag, length, checksum, reservation scope, and the active trust set, then returns a non-secret `PayloadCommitProof`.

`COMMIT_LARGE_SCHEDULE` validates the proof's canonical bytes, signature, source-time authorization, reservation state, object identity, and Broker persistence deadline. It does not call Object Store. On success, the same durable WriteBatch creates the timeline/message state, records the payload descriptor, consumes the reservation, applies quota, records the result, and advances the Source Position. The first equivalent proof is idempotent; a different object identity, length, or checksum is a conflict.

Object Store failure before Commit is retryable and does not block Command application. A proven missing or corrupt object becomes a message-level terminal error only at the bounded materialization boundary after all retention/protection conditions are satisfied.

## 3. Recovery protects references, not just files {#recovery-protection}

A checkpoint is authoritative only after its immutable manifest and exact object versions are published into the Oxia checkpoint catalog. The Recovery Set is the bounded ordered set of published checkpoints; the Recovery Floor is the oldest still-allowed checkpoint. A payload, terminal record, evidence cursor, or checkpoint object needed by any permitted descendant cannot be reclaimed before the Floor proves that no allowed recovery replay needs it.

Recovery may pin one exact candidate with a session-bound `RecoveryPin`. The pin has no client-clock expiry. The candidate remains protected until activation or an authoritative release, and the new Owner/Store activation CAS must remove the exact pin atomically with `ACTIVE_FOR_COMMANDS`.

## 4. GC is a source-ordered workflow {#gc-workflow}

Deletion that can affect replay, Query, Replay, or an external reference follows this sequence:

```text
RESOURCE_RETIRE_INTENT_V1
  -> reconstructible gc task/tombstone
  -> retention and Checkpoint Safety Barrier
  -> idempotent local/external delete
  -> response-loss resolution by exact HEAD/read
  -> RESOURCE_DELETE_CONFIRMED_V1
  -> descendant Recovery Floor
  -> completion tombstone compaction
```

For payload objects, there must be no active read/publish, no open Dead Letter replay window, and no unresolved DLQ export obligation. An abandoned reservation still retains its tombstone, object-byte quota, and upload protection until the source time fence closes the upload deadline, the old provider request horizon is quiet, exact multipart work is aborted, and a final version-aware delete is confirmed. `HEAD not found` alone is not enough while an old PUT could still arrive.

Deleting full terminal/history also does not release the stable Delay Message identity. The same durable cleanup must leave a compact retired-identity tombstone until the message-identity reuse fence, Recovery Floor, and minimum retention allow deletion. This prevents a late first Schedule from reusing an identity after its detailed history has been reclaimed.

Lane retirement uses the same guarded model: source-ordered Close first, then no pending/inflight/READY work, no protected attempt or audit references, fenced adapter channels, and a descendant Floor. Only then may the Lane record be replaced by its terminal guard and release its grant. Changing only a Lane incarnation cannot reopen an old closed tuple.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 14, 15.5, and 16.
- `docs/adr/0010-use-reserve-upload-commit-for-large-payloads.md`.
- `docs/adr/0011-tie-recovery-and-garbage-collection-to-a-checkpoint-floor.md`.
- `docs/adr/0040-use-ancestry-bound-recovery-lineages-and-pins.md`.
