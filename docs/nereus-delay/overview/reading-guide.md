---
title: Reading guide
description: A dependency-ordered path through the Nereus Delay V1 documentation.
sidebar_position: 3
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/README.md
  - docs/Nereus Delay V1 设计.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Reading guide {#reading-guide}

Read Nereus Delay in dependency order. The site summarizes the V1 design; exact numbers, bytes, fields, and codes remain in the Protocol Registry.

1. [Why Nereus Delay?](./why-nereus-delay.md) establishes goals, non-goals, and the not-before delivery boundary.
2. [Architecture](./architecture.md) identifies the Command Topic, Shard Runtime, RocksDB, Scheduler, adapters, Oxia, and Object Store.
3. [Delivery time and action time](../concepts/delivery-time-and-action-time.md) fixes the time vocabulary and fail-closed clock behavior.
4. [Commands, messages, and receipts](../concepts/commands-messages-and-receipts.md) separates prepared bytes, queued outcomes, applied results, and destination evidence.
5. [Schedule flow](../data-paths/schedule-flow.md) follows source-ordered application from preparation to durable message state.
6. [Destination Lane isolation](../operations/destination-lane-isolation.md) explains fairness, retry, capability, and target-failure isolation.
7. [Checkpoints and recovery](../operations/checkpoints-and-recovery.md) explains Recovery Set, Recovery Floor, replay, and activation.
8. [Current project status](../development/project-status.md) distinguishes local implementation evidence from release blockers.

## Authority reminder {#authority-reminder}

When a summary and a normative source disagree, update the summary. Do not choose the more convenient interpretation. See [Authority order](../reference/authority-order.md).
