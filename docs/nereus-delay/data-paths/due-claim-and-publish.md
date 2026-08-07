---
title: Due, Claim, and Publish Admission
description: How an eligible message moves from a due timeline entry through reversible materialization to a durable publish obligation.
sidebar_position: 2
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0013-make-publish-admission-the-control-point-of-no-return.md
  - docs/adr/0022-classify-publish-outcomes-by-side-effect-evidence.md
  - docs/adr/0032-use-two-level-bounded-deficit-round-robin.md
  - docs/adr/0039-serialize-command-affecting-runtime-mutations-in-the-shard-log.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Due, Claim, and Publish Admission {#due-claim-and-publish}

Nereus Delay separates “the message is eligible to try” from “a destination side effect may now exist”. The scheduler discovers due work, Claim materializes and reserves a reversible local attempt, and Publish Admission durably creates the obligation before any Producer call.

## 1. Due is an eligibility decision {#due-is-eligibility}

The timeline stores a replayable work reference containing the message generation, work kind, `actionAt`, retry eligibility, candidate attempt, and semantic-work digest. A scheduler may consider that work only when all relevant gates agree:

- the shard is `ACTIVE_FOR_COMMANDS`;
- the Lane's source-ordered `admissionGate` is `OPEN`;
- the Lane's runtime readiness is `READY`;
- the Trusted UTC interval proves that the action time has arrived and `expireAt` has not closed a new Admission;
- the ordered head, quota, capacity, permits, and capability prerequisites allow progress.

`deliverAt` remains the earliest consumer-visibility time. `actionAt` is the earliest destination action time and may be later because the selected destination capability or managed handoff requires a lead. A due item can therefore wait because of a closed gate, ordered head, recovery, capacity, or an uncertain earlier attempt. That wait is not proof that it was published or rejected.

## 2. Claim is reversible {#claim-is-reversible}

Claim runs inside the owning shard's single-writer boundary:

1. acquire bounded Worker, Lane, message, and byte permits;
2. revalidate the exact timeline key, generation, runtime revision, semantic-work digest, counters, and open attempt-obligation set;
3. persist a checked `claimSequence`, `claimId`, owner/store identity, deadline, and local fencing revision;
4. materialize the payload, checksum, adapter-specific record, and target-size checks;
5. create an immutable `PreparedPublishTemplate` without assigning an attempt or calling the destination Producer.

Cancel, Reschedule, ownership loss, timeout, transient materialization failure, or a changed replay-stable obligation set can revoke Claim. A retry returns to the same semantic timeline work with a new runtime instance digest; it does not reuse a stale local snapshot token. A proven permanent pre-send error becomes a source-ordered `CLAIM_RESULT_V1`, not a callback-only terminal write.

## 3. Publish Admission is the point of no return {#publish-admission}

The executor prepares a complete, deterministic `PUBLISH_ADMISSION_V1` mutation. Its body includes the exact Claim precondition, prepared publish descriptor and hash, attempt identity, capability evidence, Trusted UTC decision, and capacity decision. The mutation is enqueued to the same Shard Log as Client Commands and other System Mutations.

When the Admission record is consumed, the shard validates only source-replayable state and the record's Broker persistence-time evidence. If it wins, one durable WriteBatch:

```text
PUBLISH_ADMISSION_V1
  -> PUBLISHING attempt ledger
  -> GenerationRuntimeIndex obligation reference
  -> checked Admission/uncertain-retry counters
  -> appliedShardLogPosition
  -> RocksDB WAL sync
```

Only after that sync, and only while the live Owner, Store, Lane certificate, Claim token, and time gate still match, may the Adapter invoke the Producer. This gives the hard ordering:

```text
durable PUBLISHING happens-before Producer call
```

An Admission enqueue timeout retries the same prepared mutation. It does not send directly and does not allocate a new attempt identity.

## 4. Admission failure branches {#admission-failure-branches}

An Admission can be stale when an earlier source-ordered Cancel, Close, Break, expiry, or evidence result changed the replay-stable precondition. In that case it records the deterministic stale result, revokes the matching Claim, and does not call the Producer.

Owner or Store replacement, a missing local Claim after restore, or a later local wall-clock reading does not rewrite an on-time Admission whose source-order preconditions match. Replay reconstructs `PUBLISHING`. If no live first-send gate remains, a later exact Outcome records `UNKNOWN` with the recovery/owner-fenced evidence and the aggregate becomes `UNCERTAIN`.

After Admission, outcome evidence has two independent dimensions:

| Side effect | Disposition | Meaning |
| --- | --- | --- |
| `PUBLISHED` | none | Destination evidence proves the selected capability's publish. |
| `NOT_PUBLISHED` | retriable/permanent/Lane unavailable | The attempt is definitely absent; retry or terminal policy may proceed. |
| `UNKNOWN` | any applicable disposition | The side effect cannot be classified; the attempt remains an obligation. |

The system never turns a lost response into a clean non-publication result merely because the current target appears empty.

## 5. Claim and Admission are not the same metric {#not-the-same-metric}

Claim/materialization latency measures local preparation and is reversible. A Publish Admission consumes one bounded attempt only when its System Mutation is durably applied. A due message may be Claimed and later returned to the timeline without consuming an attempt; a message may also be `PUBLISHING` even when the current Owner has not yet made its first Producer call.

For fairness, the two-level bounded DRR scheduler persists rotating discovery and service state. A hot early Lane cannot restart every scan from the beginning, and a healthy `OPEN + READY` Lane is not allowed to disappear behind an unhealthy Lane within the certified capacity envelope.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 11.1, 11.2, 12, and 20.2.
- `docs/adr/0013-make-publish-admission-the-control-point-of-no-return.md`.
- `docs/adr/0022-classify-publish-outcomes-by-side-effect-evidence.md`.
- `docs/adr/0032-use-two-level-bounded-deficit-round-robin.md`.
