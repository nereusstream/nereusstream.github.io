---
title: Cancel and reschedule
description: Source-ordered cancellation, rescheduling, generation changes, and the point of no return.
sidebar_position: 3
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0013-make-publish-admission-the-control-point-of-no-return.md
  - docs/adr/0009-pin-versioned-destination-profiles-at-schedule-application.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Cancel and reschedule {#cancel-and-reschedule}

Cancel and Reschedule are Commands in the same Shard Log as Schedule. Their order is determined by Source Position, not by the SDK invocation time or a client timestamp.

## Cancel before admission {#cancel-before-admission}

Before a generation reaches durable Publish Admission, a valid Cancel can transition the managed message to its terminal canceled state. A precondition can require the caller to match the expected state/version. A command that arrives before an initial Schedule is not a deferred tombstone; V1 evaluates the command according to the source-ordered identity rules.

After a publish attempt has crossed the Admission boundary, Cancel cannot retroactively claim that no destination action occurred. The resulting state retains the appropriate admitted, published, or uncertain evidence.

## Reschedule creates a new generation {#reschedule-creates-a-generation}

A successful Reschedule atomically supersedes the old generation and creates the next generation's timeline work. The stable `delayMessageId` remains the identity of the managed message, while the generation records the lifecycle instance and publish obligations.

V1 Reschedule does not change the payload, Destination Profile binding, ordering mode, or Retry Policy. Moving to a different destination is a new business operation, not a hidden side effect of Reschedule.

## Timing and source order {#timing-and-source-order}

The new `deliverAt` and `expireAt` are validated using the Reschedule Command's Broker persistence time and the immutable Profile/configuration limits. A source-ordered operation that loses to a prior admission, close marker, or terminal state returns its stable applied/rejected outcome; it does not rewrite history based on current wall-clock state.

## Recovery and duplicate risk {#recovery-and-duplicate-risk}

If the old generation has an unresolved producer obligation, rescheduling does not erase that obligation. Its exact attempt/evidence record remains protected until the relevant resolution and Recovery Floor rules allow cleanup. The new generation starts with its own timeline and identity-checked state.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 11.3, 12, and 15.
- `docs/adr/0013-make-publish-admission-the-control-point-of-no-return.md`.
- `docs/adr/0009-pin-versioned-destination-profiles-at-schedule-application.md`.
