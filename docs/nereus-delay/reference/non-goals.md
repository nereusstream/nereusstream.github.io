---
title: V1 non-goals
description: Boundaries that Nereus Delay V1 explicitly does not promise.
sidebar_position: 4
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/IMPLEMENTATION-STATUS.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# V1 non-goals {#v1-non-goals}

These are product boundaries, not temporary documentation omissions:

- universal exactly-once delivery across Kafka and Pulsar;
- global ordering across all destinations or all tenants;
- exact-time consumer visibility at `deliverAt`;
- arbitrary per-message destination connection or credential configuration;
- changing a message's destination Profile or payload through Reschedule;
- online migration of an active message between destinations;
- treating a local checkpoint upload as recovery authority before catalog publication;
- transparent multi-cell failover beyond the one active recovery cell boundary;
- making a native `AUTO_FAST` delivery queryable, cancellable, or reschedulable as a managed message;
- calling the V1 design complete or release-ready before the remaining external evidence gates pass.

The exact non-goal list and acceptance conditions are maintained in the pinned V1 design. The implementation status document records which code and test layers exist; it does not turn these non-goals into implicit support.
