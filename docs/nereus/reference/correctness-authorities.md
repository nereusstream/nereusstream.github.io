---
title: Correctness authorities
description: The final review checklist for deciding which durable fact owns each Nereus behavior.
sidebar_position: 1
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Correctness authorities {#correctness-authorities}

Use this table when reviewing a change. A cache, provider response, task status, or protocol-local
field may accelerate a decision, but it cannot replace the durable authority listed here.

| Question | Unique authority | Not a substitute |
| --- | --- | --- |
| Is an offset committed? | Stream head plus reachable commit/intent chain | WAL success, Object existence, or an index record alone |
| Where does the next append start? | Current `committedEndOffset` plus expected-start CAS | Broker-local tail or producer guess |
| Who may append? | Append session epoch/token; Kafka also binds KRaft authority | Routing, cache, or local Leader flag |
| Where is generation 0? | Reachable commit’s primary `ReadTarget` plus repairable index | Object LIST or ledger scan |
| Which physical version wins for ordinary read? | Highest valid covering `COMMITTED` generation in the requested view | Task state or upload success |
| Which version wins for compacted read? | `TOPIC_COMPACTED` view plus binding/activation coverage constraint | Ordinary `COMMITTED` fallback |
| What identifies a Pulsar MessageId? | Projection incarnation, virtual ledger, logical offset, and batch index | Physical BK ledger ID or Object key |
| What is Pulsar ack truth? | Cursor root plus its exact snapshot reference | Local read position |
| Who controls Kafka leadership? | KRaft metadata and leader epoch | Nereus binding or local cache |
| Where is Kafka group/transaction truth? | Native internal topics and stock coordinator state | A parallel Oxia coordinator tree |
| Can a physical Object be deleted? | Root lifecycle, complete references, reader leases, and sealed journal | Object LIST or one stream’s trim |
| Can a BK ledger be deleted? | Sealed root, every-range retirement, readers/protections, inventory, activation | One `NoSuchLedger` response |
| Is a trimmed entry recoverable? | Current head/trim plus a verified, head-anchored checkpoint and tail replay | A checkpoint file stored alone |

## Review questions {#review-questions}

For any new state or shortcut, ask:

1. Which authority does it read?
2. Is the value only a cache/advisory hint, or can it conditionally publish/delete?
3. What exact identity and version are revalidated before side effects?
4. What happens if the response is lost after the provider applied the operation?
5. Which owner, reader, task, cursor, or recovery reference blocks retirement?

If the answer is “the listing looked right”, “the task finished”, or “the exception said timeout”, the
boundary is not strong enough.

## Source anchors {#source-anchors}

- [`StreamHeadRecord.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-metadata-oxia/src/main/java/com/nereusstream/metadata/oxia/records/StreamHeadRecord.java)
- [`GenerationReadResolver.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/read/GenerationReadResolver.java)
- [`PhysicalGcLifecycleService.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/gc/PhysicalGcLifecycleService.java)
- [`Overall architecture contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-overall-architecture.md)
