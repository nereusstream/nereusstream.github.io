---
title: Glossary
description: Fixed V1 meanings for Nereus Delay time, command, recovery, and destination terms.
sidebar_position: 1
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - CONTEXT.md
  - docs/README.md
last_verified: 2026-08-07
status: current-main
authority: terminology-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Glossary {#glossary}

The product repository's `CONTEXT.md` is the terminology authority. This page is a navigable reader-facing subset and does not add protocol values or new semantics.

| Term | V1 meaning |
| --- | --- |
| `deliverAt` | Earliest instant at which a destination consumer may become eligible to receive a delayed message. |
| `actionAt` | Earliest instant at which Nereus Delay may start the destination action needed to satisfy `deliverAt`. |
| Trusted UTC interval | Bounded `[earliestUtcNow, latestUtcNow]` estimate used for fail-closed timing decisions. |
| Managed Delivery | Default mode with server-side Command, query, cancel, reschedule, quota, audit, and recovery boundaries. |
| `AUTO_FAST` | Explicit SDK permission to choose a prepared managed branch or a certified native Pulsar branch before I/O. |
| Command | Immutable request to Schedule, Cancel, Reschedule, or perform another registered operation. |
| Source Position | Ingress Broker position that orders Client Commands and System Mutations within one route partition. |
| Queued Command | Command durably accepted by the ingress Broker but not yet authoritatively applied by its Delay Shard. |
| Applied Command | Command whose authoritative outcome is durably recorded by the Delay Shard. |
| Delayed Message | Managed logical message created only after a Schedule Command is successfully applied. |
| Destination Lane | Bounded group sharing destination, tenancy, and Ordering Domain characteristics for fairness, retry, and isolation. |
| Recovery Set | Bounded ordered set of published checkpoints from which recovery may choose. |
| Recovery Floor | Oldest checkpoint still permitted by the Recovery Set; resources needed by permitted checkpoints remain protected. |
| Uncertain Enqueue | Outcome where the client cannot prove whether the ingress Broker persisted the prepared command. |

## Avoid these substitutions {#avoid-these-substitutions}

- Do not call a queued command a scheduled message.
- Do not call `deliverAt` publish time or exact consumer receive time.
- Do not call a timeout definitely-not-queued.
- Do not call a local uploaded checkpoint authoritative until it is published in the catalog.
- Do not treat a Lane as an ownership or recovery unit.
