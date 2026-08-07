---
title: Glossary
description: Compact definitions for the coordinates, state, storage, and protocol terms used by Nereus.
sidebar_position: 3
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Glossary {#glossary}

Use this page for lookup; the concept and data-path pages provide the surrounding contracts.

| Term | Meaning | Do not confuse with |
| --- | --- | --- |
| Stream | Protocol-neutral, logically continuous offset sequence | Pulsar ledger, Kafka segment, Object key |
| Offset | Logical record position in a stream | BK entry ID or Object byte position |
| Entry | Indivisible payload that may cover one or more logical records | Always one logical offset |
| Ranged entry | Entry with `recordCount > 1` covering a half-open offset range | Multiple independent Objects |
| Half-open range | `[start,end)`, including start and excluding end | Closed `[start,end]` range |
| Projection | Mapping from an upper protocol coordinate to stream identity/offset | Data replication or a second log |
| Virtual ledger ID | Stable Pulsar-compatible ledger coordinate | Physical BookKeeper ledger ID |
| Primary WAL | First durable bytes required by a profile | Logical commit authority by itself |
| Object WAL | Immutable Object Store representation of primary WAL slices | A higher generation automatically visible |
| Stream head | Authority summarizing committed end, commit anchor, trim, and session | All message indexes |
| Commit intent | Immutable description written before head CAS | Independently visible message |
| Reachable commit | Commit reachable from the head’s last commit ID | Any intent present in Oxia |
| CAS | Conditional update that applies only when version/preconditions match | Unconditional overwrite |
| Linearization point | Unique instant an operation becomes logically committed | Any provider success response |
| Append session | Stream-scoped epoch/token writer identity | Broker ownership watch alone |
| Fencing | New epoch/token invalidating an old writer | Merely disconnecting a socket |
| Append authority | External monotonic Leader/owner term bound to a session | Kafka type inside L0 |
| ReadTarget | Exact physical read description for one logical range | Cache handle or Object listing |
| Offset index | Derived mapping from offset range to ReadTarget | Append truth |
| Generation 0 | Append-time primary ReadTarget representation | The first logical message |
| Higher generation | Replacement physical representation for one stream/view/range | A new logical message |
| Read view | Semantic read domain such as `COMMITTED` or `TOPIC_COMPACTED` | Storage profile |
| Materialization | Copy/re-encode of committed source into an immutable output and publication | A new append |
| Compaction | Materialization that may be lossless or key-based/semantic | Always valid for ordinary reads |
| `PREPARED` generation | Output and index prepared but not visible | Reader-selectable target |
| `COMMITTED` generation | Publication CAS succeeded; eligible reader candidate | Append head commit in all contexts |
| Quarantine | Isolation of damaged or identity-mismatched formal candidate | Logical rollback |
| Reader pin/lease | Cross-process bounded read protection | JVM reference count |
| Protection | Durable task/append/cursor reference to a physical resource | Physical replica itself |
| Checkpoint | Immutable recovery state at a stable boundary | Authority that may lead the head |
| Trim | Moves the earliest logically readable offset | Immediate physical deletion |
| Retention | Policy deciding which logical ranges may expire | Consumer ack synonym |
| Source retirement | Old source no longer serves read/recovery duties | Object necessarily deleted |
| GC | Aggregates references before reclaiming Object/ledger | Delete after LIST |
| Orphan | Bytes/intent not referenced by authoritative state | A damaged formal generation |
| Fail closed | Refuse when safety cannot be proven | Guessing a fallback path |
| Cursor root | Single-key CAS authority for Pulsar durable subscription state | Local read position |
| `markDeleteOffset` | First Entry offset not cumulatively acknowledged | Pulsar’s last returned Position itself |
| Cursor generation | Subscription delete/recreate lifecycle number | Ack reset epoch |
| `ackStateEpoch` | Same-cursor-generation reset/clear replacement number | Stream `commitVersion` |
| KRaft | Kafka control plane for Topic/partition/Leader metadata | Nereus stream metadata |
| LEO | Kafka next record offset | Physical file length |
| HW | Kafka consumer-visible replicated boundary | Nereus generation number |
| LSO | Kafka `READ_COMMITTED` transaction-stable boundary | Stream trim offset |
| Binding | Durable Topic/partition lifecycle to storage class or stream mapping | A message index |
| Activation | Proof that a cluster can use a durable protocol consistently | A data commit |

## Source anchors {#source-anchors}

- [`Nereus terminology`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-terminology.md)
- [`Overall architecture`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-overall-architecture.md)
