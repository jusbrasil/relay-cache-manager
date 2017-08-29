'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deserializeRangesInRecord = exports.serializeRangesInRecord = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Manages all cached records, including read/write and
                                                                                                                                                                                                                                                                   * deserialization.
                                                                                                                                                                                                                                                                   * 
                                                                                                                                                                                                                                                                   */

var _GraphQLRange = require('react-relay/lib/GraphQLRange');

var _GraphQLRange2 = _interopRequireDefault(_GraphQLRange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * These types are being copied from RelayInternalTypes.
 * Relay does not currently offer a way to use internal
 * type definitions. Since this library is essentially
 * mimicking internal data structures, we just copy what we
 * need manually until a better solution presents itself.
 *
 * https://github.com/facebook/relay/blob/master/src/tools/RelayInternals.js
 */

var serializeRangesInRecord = exports.serializeRangesInRecord = function serializeRangesInRecord(record) {
  var range = record.__range__; // eslint-disable-line no-underscore-dangle
  return _extends({}, record, {
    __range__: range && !Array.isArray(range) ? range.toJSON() : range
  });
};

var deserializeRangesInRecord = exports.deserializeRangesInRecord = function deserializeRangesInRecord(record) {
  var range = record.__range__; // eslint-disable-line no-underscore-dangle
  return _extends({}, record, {
    __range__: range && Array.isArray(range) ? _GraphQLRange2.default.fromJSON(range) : range
  });
};

var CacheRecordStore = function () {
  function CacheRecordStore(records, rootCallMap) {
    _classCallCheck(this, CacheRecordStore);

    this.records = records || {};
    this.rootCallMap = rootCallMap || {};
  }

  _createClass(CacheRecordStore, [{
    key: 'writeRootCall',
    value: function writeRootCall(storageKey, identifyingArgValue, dataId) {
      this.rootCallMap[storageKey] = dataId;
    }
  }, {
    key: 'writeRecord',
    value: function writeRecord(dataId, record) {
      this.records[dataId] = record;
    }
  }, {
    key: 'getDataIdFromRootCallName',
    value: function getDataIdFromRootCallName(callName, callValue) {
      return this.rootCallMap['' + callName + callValue];
    }
  }, {
    key: 'readNode',
    value: function readNode(dataID) {
      return this.records[dataID] || null;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this = this;

      var records = {};
      Object.keys(this.records).forEach(function (key) {
        records[key] = serializeRangesInRecord(_this.records[key]);
      });
      return {
        records: records,
        rootCallMap: this.rootCallMap
      };
    }

    /**
     * Takes an object that represents a previously deserialized
     * instance of CacheRecordStore and update the current instance
     */

  }, {
    key: 'updateFromJSON',
    value: function updateFromJSON(_ref) {
      var records = _ref.records,
          rootCallMap = _ref.rootCallMap;

      Object.assign(this.records, records);
      Object.assign(this.rootCallMap, rootCallMap);
    }
  }]);

  return CacheRecordStore;
}();

exports.default = CacheRecordStore;