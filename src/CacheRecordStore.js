/**
 * Manages all cached records, including read/write and
 * deserialization.
 * @flow
 */

import GraphQLRange from 'react-relay/lib/GraphQLRange';


/**
 * These types are being copied from RelayInternalTypes.
 * Relay does not currently offer a way to use internal
 * type definitions. Since this library is essentially
 * mimicking internal data structures, we just copy what we
 * need manually until a better solution presents itself.
 *
 * https://github.com/facebook/relay/blob/master/src/tools/RelayInternals.js
 */

type CallValue = ?(
  boolean |
  number |
  string |
  {[key: string]: CallValue} |
  Array<CallValue>
);

type Call = {
  name: string,
  type?: string,
  value: CallValue,
};

export type CacheRecord = {
  [key: string]: mixed;
  __dataID__: string,
  __filterCalls__?: Array<Call>,
  __forceIndex__?: number,
  __mutationIDs__?: Array<string>,
  __mutationStatus__?: string,
  __path__?: Object,
  __range__?: GraphQLRange,
  __resolvedDeferredFragments__?: {[fragmentID: string]: boolean},
  __resolvedFragmentMapGeneration__?: number,
  __resolvedFragmentMap__?: {[fragmentID: string]: boolean},
  __status__?: number,
  __typename?: ?string,
};

export type CacheRecordMap = {
  [dataId: string]: CacheRecord,
}

export type CacheRootCallMap = {
  [root: string]: string,
}

type CacheInstance = {
  records: CacheRecordMap,
  rootCallMap: CacheRootCallMap
}

export const serializeRangesInRecord = (record: CacheRecord): CacheRecord => {
  const range = record.__range__; // eslint-disable-line no-underscore-dangle
  return {
    ...record,
    __range__: range && !Array.isArray(range)
      ? range.toJSON()
      : range,
  };
};

export const deserializeRangesInRecord = (record: CacheRecord): CacheRecord => {
  const range = record.__range__; // eslint-disable-line no-underscore-dangle
  return {
    ...record,
    __range__: range && Array.isArray(range)
      ? GraphQLRange.fromJSON(range)
      : range,
  };
};

export default class CacheRecordStore {
  records: CacheRecordMap;
  rootCallMap: CacheRootCallMap;
  constructor(
    records?: CacheRecordMap,
    rootCallMap?: CacheRootCallMap
  ) {
    this.records = records || {};
    this.rootCallMap = rootCallMap || {};
  }

  writeRootCall(
    storageKey: string,
    identifyingArgValue: string,
    dataId: string
  ) {
    this.rootCallMap[`${storageKey}${identifyingArgValue}`] = dataId;
  }

  writeRecord(
    dataId: string,
    record: CacheRecord
  ) {
    this.records[dataId] = record;
  }

  getDataIdFromRootCallName(
    callName: string,
    callValue: string
  ): ?string {
    return this.rootCallMap[`${callName}${callValue}`];
  }

  readNode(dataID: string): ?CacheRecord {
    return this.records[dataID] || null;
  }

  toJSON(): CacheInstance {
    const records = {};
    Object.keys(this.records).forEach(key => {
      records[key] = serializeRangesInRecord(this.records[key]);
    });
    return {
      records,
      rootCallMap: this.rootCallMap,
    };
  }

  /**
   * Takes an object that represents a previously deserialized
   * instance of CacheRecordStore and update the current instance
   */
  updateFromJSON({ records, rootCallMap }: CacheInstance) {
    Object.assign(this.records, records);
    Object.assign(this.rootCallMap, rootCallMap);
  }
}
