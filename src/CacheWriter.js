/**
 *  Implements the CacheWriter interface specified by
 *  RelayTypes, uses an instance of CacheRecordStore
 *  to manage the CacheRecord instances
 *  @flow
 */

import CacheRecordStore, {
  serializeRangesInRecord,
  deserializeRangesInRecord,
} from './CacheRecordStore';
import type { CacheRecord } from './CacheRecordStore';

const DEFAULT_CACHE_KEY: string = '__RelayCacheManager__';

export type CacheWriterOptions = {
  cacheKey?: string,
  writeInterval?: number,
}

export default class CacheWriter {
  cache: CacheRecordStore;
  cacheKey: string;
  writeInterval: number;
  writeTimeout: setTimeout;

  constructor(options: CacheWriterOptions = {}) {
    this.cacheKey = options.cacheKey || DEFAULT_CACHE_KEY;
    this.writeInterval = options.writeInterval || 500;
    this.cache = new CacheRecordStore();

    let localCache = localStorage.getItem(this.cacheKey);
    if (localCache) {
      try {
        localCache = JSON.parse(localCache);
        this.cache = CacheRecordStore.fromJSON(localCache);
      } catch (err) {
        console.error('Could not update cache from JSON', err);
      }
    }
  }

  clearStorage() {
    localStorage.removeItem(this.cacheKey);
    this.cache = new CacheRecordStore();
  }

  throttle(fn: Function) {
    const context = this;
    if (!this.writeTimeout) {
      this.writeTimeout = setTimeout(() => {
        fn.apply(context);
        this.writeTimeout = null;
      }, this.writeInterval);
    }
  }

  writeField(
    dataId: string,
    field: string,
    value: ?mixed,
    typeName: ?string
  ) {
    let record = this.cache.records[dataId];
    if (!record) {
      record = {
        __dataID__: dataId,
        __typename: typeName,
      };
    }
    record[field] = value;
    this.cache.records[dataId] = record;
    this.throttle(() => {
      let cache = [];
      const serialized = JSON.stringify(this.cache.toJSON(), (k, v) => {
        if (typeof v === 'object' && v !== null) {
          if (cache && cache.indexOf(v) !== -1) {
            // Circular reference found, discard key
            return null;
          }
          // Store value in our collection
          if (cache) {
            cache.push(v);
          }
        }
        return v;
      });

      cache = null;
      localStorage.setItem(this.cacheKey, serialized);
    });
  }

  writeNode(dataId: string, record: CacheRecord) {
    this.cache.writeRecord(dataId, serializeRangesInRecord(record));
  }

  readNode(dataId: string) {
    const record = this.cache.readNode(dataId);
    return record && deserializeRangesInRecord(record);
  }

  writeRootCall(
    storageKey: string,
    identifyingArgValue: string,
    dataId: string
  ) {
    this.cache.rootCallMap[storageKey] = dataId;
  }

  readRootCall(
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void
  ) {
    const dataId = this.cache.rootCallMap[callName];
    setImmediate(callback.bind(null, null, dataId));
  }
}
