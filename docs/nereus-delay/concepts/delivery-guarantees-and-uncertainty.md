---
title: Delivery guarantees and uncertainty
description: At-least-once baseline, stronger opt-in capabilities, and typed uncertain outcomes.
sidebar_position: 5
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - CONTEXT.md
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0022-classify-publish-outcomes-by-side-effect-evidence.md
  - docs/adr/0034-make-command-application-deterministic-under-replay.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Delivery guarantees and uncertainty {#delivery-guarantees-and-uncertainty}

## Baseline at-least-once {#baseline-at-least-once}

The baseline capability is bounded `AT_LEAST_ONCE`:

- a crash or lost acknowledgement does not become an invented success;
- the pinned retry and expiration policy can retry the operation;
- the destination may observe a duplicate;
- applications can use `delayMessageId + generation` for their own deduplication.

At-least-once is bounded by retry budget, `expireAt`, permanent errors, and explicit operator policy. It is not an infinite retry promise.

## Stronger capabilities are opt-in {#stronger-capabilities}

Kafka transactional receipt and Pulsar Broker dedup capabilities are separate Profile choices. They are valid only while all required destination identity, capability, credential, evidence, and resource-incarnation prerequisites remain certified. Capability drift removes Lane readiness rather than silently downgrading the declared guarantee.

## Uncertain is a first-class result {#uncertain-is-a-first-class-result}

After a Producer has taken ownership, a timeout, lost callback, connection break, or process crash cannot prove that the target did not persist the record. The correct result is an uncertainty branch with the exact prepared command, generation, attempt, and evidence scope attached.

Recovery may later attach verified published or verified-not-published evidence. A possible duplicate may also be retained or terminalized only through the explicit bounded policy and source-ordered control path. It must never be changed into a clean non-publication result because the current target state happens to look empty.

## Durable admission separates cancel from publish {#durable-admission}

The Publish Admission is the point of no return. Before it is durably applied, Cancel or Reschedule can win according to Source Position and preconditions. After admission, the system must classify the producer outcome and retain uncertainty rather than pretending that a later cancellation erased an external side effect.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 3.3, 11, 13, and 15.
- `docs/adr/0022-classify-publish-outcomes-by-side-effect-evidence.md`.
- `docs/adr/0034-make-command-application-deterministic-under-replay.md`.
