---
title: Ownership and activation
description: Source assignment, Oxia Owner Lease, shard activation, Lane readiness, and bounded drain behavior.
sidebar_position: 3
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0008-isolate-destination-lanes-from-command-application.md
  - docs/adr/0017-require-source-assignment-and-an-oxia-owner-lease.md
  - docs/adr/0027-use-checkpoint-replay-recovery-without-warm-standby.md
  - docs/adr/0040-use-ancestry-bound-recovery-lineages-and-pins.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Ownership and activation {#ownership-and-activation}

Nereus Delay has separate authority boundaries for shard mutation and destination publication. A Worker needs both the ingress Source Assignment and the session-bound Oxia Owner Lease for the same shard. A Destination Lane additionally needs its own source-ordered gate and runtime evidence before it may Claim or admit work.

## 1. Shard ownership has two gates {#two-shard-gates}

The canonical Owner Lease is a single-holder ephemeral record containing shard identity, Worker/process run, monotonic `ownerEpoch`, fencing digest, Source Assignment identity, lifecycle, and Oxia session identity. The Worker closes its local lease guard before the Oxia session could become externally absent.

No new shard mutation, Claim, Publish Admission, callback mutation, or checkpoint publication is allowed when either authority is missing or ambiguous. Watch delivery is only a refresh hint; correctness does not wait for a watch callback.

The lifecycle is deliberately closed:

```text
UNASSIGNED -> ACQUIRING -> RESTORING -> CATCHING_UP
            -> ACTIVE_FOR_COMMANDS -> DRAINING -> UNASSIGNED

any nonterminal -> FENCED -> UNASSIGNED or ACQUIRING
any nonterminal -> FAILED
```

`FENCED` means this Worker has zero mutation and publication authority and may be reassigned. `FAILED` is reserved for proven source gaps, store/catalog integrity failures, or unrecoverable protocol invariants; it does not automatically return to `ACTIVE_FOR_COMMANDS`.

## 2. Activation sequence {#activation-sequence}

An acquiring Worker follows a bounded, evidence-producing sequence:

1. pause the source partition and establish a pinned, uncertified source channel;
2. allocate a fresh Owner Epoch and create the lease with `expected-not-exists`;
3. choose or restore a Store Incarnation from a permitted Recovery Set candidate;
4. open the DB, replay from the Adapter-defined successor of the applied Source Position, and verify source continuity;
5. prove the exact Broker Resource Incarnation and capture a typed Activation Barrier;
6. replay through that barrier and recheck assignment, lease, Store, config versions, and shard invariants;
7. CAS the same ephemeral lease to `ACTIVE_FOR_COMMANDS`;
8. activate each Destination Lane independently.

The Activation Barrier is a typed Broker cursor, not a normal record Source Position. Kafka uses the pinned topic identity and exclusive cursor; Pulsar uses the adapter's inclusive entry/batch semantics. Identity mismatch, capture failure, or an incomparable cursor prevents activation.

## 3. Lane readiness is independent {#lane-readiness}

Each Lane carries two orthogonal state axes:

| Axis | Values | Authority |
| --- | --- | --- |
| `admissionGate` | `OPEN`, `ADMIN_PAUSED`, `ORDERING_BROKEN`, `CLOSED`, `RETIRED` | Source-ordered management mutations |
| `runtimeReadiness` | `RECOVERING_EVIDENCE`, `READY`, `BLOCKED` | Current Owner, channel, capability, and evidence checks |

The first Schedule can create a Lane as `OPEN + RECOVERING_EVIDENCE` without touching the destination. The Lane activator then validates the pinned resource incarnation, channel, capability/evidence barrier, credential binding, and Trusted UTC certificate. Only `OPEN + READY` can enter due discovery, Claim, or Admission.

A target outage or credential/capability drift moves that Lane to `BLOCKED` or `RECOVERING_EVIDENCE`. It does not pause Command application, rewrite an applied Schedule, or block a healthy Lane. Conversely, `Pause`, `Break`, and `Close` change only the source-ordered management axis; a later recovery cannot silently clear them.

`READY` is a certificate, not a permanent boolean. The certificate is bound to Owner/Store/Lane incarnation, adapter channel generation, evidence cursors, Broker attestation, credential binding generation/fingerprint, protected credential lease, and Trusted UTC expiry. Claim, Admission preparation, and the first Producer call revalidate the live certificate locally.

## 4. Drain and takeover {#drain-and-takeover}

Planned drain stops source fetch, due Claim, and new Admission; revokes reversible Claims; waits a bounded interval for already-admitted callbacks; flushes and syncs RocksDB; optionally publishes a final checkpoint; closes the Store; and releases the exact lease. A timeout leaves a visible draining/fenced boundary for safe retry.

On takeover, a valid replayed Admission reconstructs the same `PUBLISHING` obligation. If the old Owner's first-send gate cannot be proven, the new Owner records the exact recovery `UNKNOWN` Outcome. It does not resend an unproven first call or claim that no side effect occurred.

Recovery of one Lane's destination evidence can remain blocked while the shard applies Commands and other Lanes recover. A recovery candidate is valid only when its checkpoint ancestry, Recovery Floor, source log, evidence cursors, referenced payloads, and Oxia catalog identity are all proven. There is no warm-standby shortcut and no automatic promotion of a differently positioned mirror topic.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 9, 12.1, and 16.4.
- `docs/adr/0008-isolate-destination-lanes-from-command-application.md`.
- `docs/adr/0017-require-source-assignment-and-an-oxia-owner-lease.md`.
- `docs/adr/0027-use-checkpoint-replay-recovery-without-warm-standby.md`.
- `docs/adr/0040-use-ancestry-bound-recovery-lineages-and-pins.md`.
