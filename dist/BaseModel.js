"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ModelCollection_1 = require("./ModelCollection");
var MixinSerializableTrait_1 = require("./modelTraits/MixinSerializableTrait");
var MixinValidatableTrait_1 = require("./modelTraits/MixinValidatableTrait");
var ModelClassMixinContainer = /** @class */ (function () {
    function ModelClassMixinContainer() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    return ModelClassMixinContainer;
}());
var BaseModel = /** @class */ (function (_super) {
    __extends(BaseModel, _super);
    function BaseModel(properties) {
        var _this = _super.call(this, properties) || this;
        _this.getReactKey = function () {
            var _a;
            _this.reactKey = (_a = _this.reactKey, (_a !== null && _a !== void 0 ? _a : (BaseModel.reactKey += 1)));
            return _this.reactKey;
        };
        _this.init();
        return _this;
    }
    BaseModel.prototype.getJsonRoot = function () {
        return this.constructor.jsonRoot;
    };
    BaseModel.prototype.serialize = function (root) {
        if (root === void 0) { root = true; }
        var objectToReturn = {};
        var propertiesCopy = __assign({}, (this.properties));
        delete propertiesCopy.errors;
        for (var _i = 0, _a = Object.keys(propertiesCopy); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = propertiesCopy[key];
            objectToReturn[key] = this.normalizeWhenSerializing(value, false);
        }
        if (root && this.getJsonRoot()) {
            var jsonRoot = this.getJsonRoot();
            var objectToReturnWithRoot = {};
            objectToReturnWithRoot[jsonRoot] = objectToReturn;
            return objectToReturnWithRoot;
        }
        else {
            return objectToReturn;
        }
    };
    BaseModel.prototype.normalizeWhenSerializing = function (value, root) {
        if (root === void 0) { root = false; }
        if (value instanceof BaseModel) {
            return value.serialize(root);
        }
        else if (value instanceof ModelCollection_1.ModelCollection) {
            var mapped = value.array.map(function (it) {
                return it.serialize(false);
            });
            return mapped;
        }
        else {
            return value;
        }
    };
    BaseModel.afterIndexRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, collection, returnedArray;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, options.rootPromise];
                    case 1:
                        resp = _a.sent();
                        collection = new ModelCollection_1.ModelCollection();
                        returnedArray = resp;
                        returnedArray.forEach(function (properties) {
                            collection.push(new _this(properties));
                        });
                        return [2 /*return*/, collection];
                }
            });
        });
    };
    BaseModel.parsePaginated = function (response) {
        var _this = this;
        var collection = new ModelCollection_1.ModelCollection();
        var returnedArray = response.result;
        returnedArray.forEach(function (properties) {
            collection.push(new _this(properties));
        });
        return {
            result: collection,
            pagination: response.pagination
        };
    };
    BaseModel.afterShowRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var response, modelToReturn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, options.rootPromise];
                    case 1:
                        response = _a.sent();
                        modelToReturn = new this(response);
                        modelToReturn.validate();
                        return [2 /*return*/, modelToReturn];
                }
            });
        });
    };
    BaseModel.afterNewRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, options.rootPromise];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, new this(response)];
                }
            });
        });
    };
    BaseModel.afterEditRequest = function (options) {
        this.afterShowRequest(options);
    };
    BaseModel.prototype.beforeUpdateRequest = function (options) {
        this.beforeCreateRequest(options);
    };
    BaseModel.prototype.afterUpdateRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.afterCreateRequest(options)];
            });
        });
    };
    BaseModel.prototype.beforeCreateRequest = function (options) {
        options.payload = this.serialize();
    };
    BaseModel.prototype.afterCreateRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var response, modelToReturn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, options.rootPromise];
                    case 1:
                        response = _a.sent();
                        modelToReturn = new this.constructor(response);
                        modelToReturn.validate();
                        return [2 /*return*/, modelToReturn];
                }
            });
        });
    };
    BaseModel.prototype.beforeDeleteRequest = function (options) {
        this.beforeUpdateRequest(options);
    };
    BaseModel.prototype.afterDeleteRequest = function (options) {
        this.afterUpdateRequest(options);
    };
    BaseModel.prototype.beforeDestroyRequest = function (options) {
        this.beforeUpdateRequest(options);
    };
    BaseModel.prototype.afterDestroyRequest = function (options) {
        this.afterUpdateRequest(options);
    };
    BaseModel.reactKey = 0;
    BaseModel.jsonRoot = null;
    return BaseModel;
}(MixinSerializableTrait_1.MixinSerializableTrait(MixinValidatableTrait_1.MixinValidatableTrait(ModelClassMixinContainer))));
exports.BaseModel = BaseModel;
