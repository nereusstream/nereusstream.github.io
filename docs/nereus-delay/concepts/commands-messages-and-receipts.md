---
title: Commands, messages, and receipts
description: How Nereus Delay separates prepared commands, queued and applied outcomes, and destination evidence.
sidebar_position: 2
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - CONTEXT.md
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0005-separate-command-queuing-from-application.md
  - docs/adr/0006-stabilize-command-identity-before-enqueue.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Commands, messages, and receipts {#commands-messages-and-receipts}

## Prepared Command {#prepared-command}

A `Prepared Command` fixes the Route, physical partition, command identity, delayed-message identity, canonical body, hash, and retry boundary before network I/O. A physical enqueue retry reuses the exact prepared bytes and identity. A new business operation requires a new preparation; an uncertain enqueue is not permission to invent a new command ID.

The V1 Protocol Registry fixes the frame, canonical encoding, field presence, stable codes, and hash domains. This page intentionally does not duplicate those byte-level tables.

## Command versus Delayed Message {#command-versus-delayed-message}

A `Command` is an immutable request to Schedule, Cancel, Reschedule, or perform another registered operation. A `Delayed Message` exists only after its Schedule Command has been authoritatively applied. A queued or rejected Schedule does not by itself create a Delayed Message.

## Outcome levels {#outcome-levels}

| Level | Meaning | What it does not prove |
| --- | --- | --- |
| `QUEUED` | The ingress Broker durably accepted the Command | The Delay Shard applied it or created a message |
| `APPLIED` / `REJECTED` | The Delay Shard durably recorded its authoritative result | A target producer published a destination record |
| `PUBLISHED` | The destination Adapter has the capability-specific durable evidence for a target append or handoff | Universal exactly-once or consumer processing completion |
| `UNCERTAIN` | The system cannot prove whether a producer-side operation became durable | That the target definitely did not receive the record |

`CommandQueuedReceipt` and `CommandAppliedReceipt` are distinct. Query answers become conclusive only after the applicable Source Position barrier; a client-side timeout is not proof of non-persistence.

## Managed and AUTO_FAST {#managed-and-auto-fast}

`MANAGED` is the default. It enters the Command Topic and supports query, cancellation, rescheduling, quota, audit, checkpoint, DLQ, and replay boundaries before the relevant point of no return.

`AUTO_FAST` is explicit caller permission for the SDK to choose, before any I/O, between an exact managed prepared command and a direct certified Pulsar native delivery. The selected sealed object is persisted and submitted as-is. Native I/O does not silently fall back to managed delivery; a response loss remains native uncertainty.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 3.2, 3.3, and 6.
- `docs/adr/0005-separate-command-queuing-from-application.md`.
- `docs/adr/0006-stabilize-command-identity-before-enqueue.md`.
