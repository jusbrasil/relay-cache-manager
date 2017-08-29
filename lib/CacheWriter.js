'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  Implements the CacheWriter interface specified by
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  RelayTypes, uses an instance of CacheRecordStore
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  to manage the CacheRecord instances
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _CacheRecordStore = require('./CacheRecordStore');

var _CacheRecordStore2 = _interopRequireDefault(_CacheRecordStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_CACHE_KEY = '__RelayCacheManager__';

var CacheWriter = function () {
  function CacheWriter() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, CacheWriter);

    this.cacheKey = options.cacheKey || DEFAULT_CACHE_KEY;
    this.writeInterval = options.writeInterval || 500;
    this.cache = new _CacheRecordStore2.default();

    var localCache = localStorage.getItem(this.cacheKey);
    if (localCache) {
      try {
        localCache = JSON.parse(localCache);
        this.cache.updateFromJSON(localCache);
      } catch (err) {
        console.error('Could not update cache from JSON', err);
      }
    }
  }

  _createClass(CacheWriter, [{
    key: 'clearStorage',
    value: function clearStorage() {
      localStorage.removeItem(this.cacheKey);
      this.cache = new _CacheRecordStore2.default();
    }
  }, {
    key: 'throttle',
    value: function throttle(fn) {
      var _this = this;

      var context = this;
      if (!this.writeTimeout) {
        this.writeTimeout = setTimeout(function () {
          fn.apply(context);
          _this.writeTimeout = null;
        }, this.writeInterval);
      }
    }
  }, {
    key: 'writeField',
    value: function writeField(dataId, field, value, typeName) {
      var _this2 = this;

      var record = this.cache.records[dataId];
      if (!record) {
        record = {
          __dataID__: dataId,
          __typename: typeName
        };
      }
      record[field] = value;
      this.cache.records[dataId] = record;
      this.throttle(function () {
        var cache = [];
        var serialized = JSON.stringify(_this2.cache.toJSON(), function (k, v) {
          if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' && v !== null) {
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
        localStorage.setItem(_this2.cacheKey, serialized);
      });
    }
  }, {
    key: 'writeNode',
    value: function writeNode(dataId, record) {
      this.cache.writeRecord(dataId, (0, _CacheRecordStore.serializeRangesInRecord)(record));
    }
  }, {
    key: 'readNode',
    value: function readNode(dataId) {
      var record = this.cache.readNode(dataId);
      return record && (0, _CacheRecordStore.deserializeRangesInRecord)(record);
    }
  }, {
    key: 'writeRootCall',
    value: function writeRootCall(storageKey, identifyingArgValue, dataId) {
      this.cache.rootCallMap[storageKey] = dataId;
    }
  }, {
    key: 'readRootCall',
    value: function readRootCall(callName, callValue, callback) {
      var dataId = this.cache.rootCallMap[callName];
      setImmediate(callback.bind(null, null, dataId));
    }
  }]);

  return CacheWriter;
}();

exports.default = CacheWriter;