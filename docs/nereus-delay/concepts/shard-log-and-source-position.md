---
title: Shard Log and Source Position
description: The durable ingress order that makes Nereus Delay command application and replay deterministic.
sidebar_position: 3
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/V1-PROTOCOL-REGISTRY.md
  - docs/adr/0007-use-source-position-as-the-sole-command-order.md
  - docs/adr/0023-make-command-topics-replayable-non-compacted-logs.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Shard Log and Source Position {#shard-log-and-source-position}

The configured Kafka or Pulsar Command Topic is more than a transport queue. One physical partition is the complete Shard Log for one Delay Shard. Client Commands and authenticated service System Mutations share that source order.

## Source Position {#source-position}

A Source Position identifies an ingress Broker position within one Route partition. Kafka uses its pinned topic/partition/offset identity; Pulsar uses its ledger/entry/batch coordinate with the adapter-defined comparison rules. Positions from different routes, topics, or partitions are not comparable.

The source position, not client time, UUID order, receipt time, or Worker wall clock, is the sole Command order. It is also the order used for replay, control markers, time fences, and deterministic application.

## Shard Log frame {#shard-log-frame}

V1 values use the Registry-defined `NDL1` frame:

```text
magic | framing version | record kind | flags | payload length
      | canonical envelope | CRC32C
```

The frame is bounded, checksummed, and closed. Unknown flags, trailing bytes, invalid kind/oneof combinations, bad CRC, non-minimal encoding, and unregistered values are malformed input. Exact widths, field numbers, and canonical bytes belong to the pinned Protocol Registry.

## ACK-after-sync {#ack-after-sync}

An ingress record is acknowledged only after the Shard Runtime has durably applied or quarantined the record through its source end. A queued Broker receipt is therefore separate from a Command Applied result. For a malformed or unsupported source record whose identity cannot be trusted, the shard records a position-level quarantine result so source progress is explicit rather than silently skipping data.

## Replay contract {#replay-contract}

Replay uses canonical Command bytes, Broker source metadata, preceding durable shard state, immutable referenced versions, and source-ordered control markers. Live destination state, current Worker time, cache timing, and physical disk size are not business-result inputs. This is the basis for rebuilding the same result from a permitted checkpoint.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 7 and 8.
- `docs/adr/0007-use-source-position-as-the-sole-command-order.md`.
- `docs/adr/0023-make-command-topics-replayable-non-compacted-logs.md`.
