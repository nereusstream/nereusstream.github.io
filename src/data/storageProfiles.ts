export type StorageProfile = {
  index: string;
  name: string;
  mode: 'sync' | 'async';
  wal: string;
  objectWork: string;
  boundary: string;
};

export const storageProfiles: StorageProfile[] = [
  {
    index: '01',
    name: 'BOOKKEEPER_WAL_ONLY',
    mode: 'sync',
    wal: 'BookKeeper',
    objectWork: 'Disabled',
    boundary: 'BK durable + stable projection',
  },
  {
    index: '02',
    name: 'BOOKKEEPER_WAL_SYNC_OBJECT',
    mode: 'sync',
    wal: 'BookKeeper',
    objectWork: 'Synchronous',
    boundary: 'BK + visible object index',
  },
  {
    index: '03',
    name: 'BOOKKEEPER_WAL_ASYNC_OBJECT',
    mode: 'async',
    wal: 'BookKeeper',
    objectWork: 'Background worker',
    boundary: 'BK durable + stable projection',
  },
  {
    index: '04',
    name: 'OBJECT_WAL_SYNC_OBJECT',
    mode: 'sync',
    wal: 'Object WAL',
    objectWork: 'Synchronous',
    boundary: 'Object WAL + visible index',
  },
  {
    index: '05',
    name: 'OBJECT_WAL_ASYNC_OBJECT',
    mode: 'async',
    wal: 'Object WAL',
    objectWork: 'Background read-optimized objects',
    boundary: 'Object WAL durable + stable projection',
  },
];
