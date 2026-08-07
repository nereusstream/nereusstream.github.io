---
title: Security and multi-tenancy
description: Canonical identities, provider scopes, checksum domains, and secret-handling boundaries.
sidebar_position: 7
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Security and multi-tenancy {#security-and-multitenancy}

Nereus treats identity construction, provider scope, and verification as correctness and security
boundaries. User-controlled names must never become raw metadata paths or object keys.

## Canonical key components {#canonical-identities}

Cluster, tenant, namespace, Topic, partition, stream, and object identity are encoded by the shared
canonical codec before entering an Oxia key or Object key. The encoding prevents path separators from
changing hierarchy, aliases from producing the same key, traversal/symlink escape, and cross-cluster
reads or deletes.

The same canonical identity must be carried through the durable binding, physical root, protection,
generation index, and audit record. A human-readable name is not sufficient to authorize a physical
mutation.

## Provider credential scope {#provider-scope}

Object credentials should be restricted to the configured bucket/prefix. BookKeeper reservations bind
to an exact provider namespace, and Oxia keyspace includes the cluster prefix. Before GC or recovery,
the runtime verifies cluster identity, scope digest, root owner, capability/activation, and exact
Object or ledger identity.

## Checksum domains {#checksum-domains}

Nereus keeps checksum domains distinct:

- provider transport checksum;
- full Object checksum;
- section/slice checksum;
- target-identity SHA-256;
- durable-record value checksum;
- source-set and policy digest.

Passing one domain does not validate another. Readers verify structure, bounds, format version, and
the required checksum sequence before exposing bytes to a protocol adapter.

## Secrets and diagnostics {#secrets}

Metadata and audit records store hashed or redacted identities. Secrets, passwords, and full provider
credentials do not belong in Oxia values, ordinary target records, or error logs. BookKeeper password
material is resolved through provider configuration/reference; Object SDK errors are redacted before
being emitted.

## Local provider boundary {#local-provider}

The local filesystem Object provider is a test aid. Production runtime rejects an undeclared
`local`/`file` provider and protects test paths from traversal and symlink escape. A test provider
must not silently widen production credential or delete scope.

## Source anchors {#source-anchors}

- [`KeyComponentCodec.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/keys/KeyComponentCodec.java)
- [`PhysicalObjectIdentity.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/physical/PhysicalObjectIdentity.java)
- [`Phase4PhysicalGcRuntime.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-pulsar-adapter/src/main/java/com/nereusstream/pulsar/Phase4PhysicalGcRuntime.java)
