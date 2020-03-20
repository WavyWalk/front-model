"use strict";
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
var index_1 = require("../index");
var ObjectToQueryStringSerializer_1 = require("../utils/ObjectToQueryStringSerializer");
var UrlPreparator = /** @class */ (function () {
    function UrlPreparator(url) {
        this.wildsToIndexMap = {};
        this.splittedUrl = url.split("/");
        this.url = url;
        this.prepareWildsToIndexMap();
    }
    UrlPreparator.prototype.prepareWildsToIndexMap = function () {
        for (var i = 0; i < this.splittedUrl.length; i++) {
            var value = this.splittedUrl[i];
            if (value[0] === ":") {
                this.hasWilds = true;
                this.wildsToIndexMap[value.substring(1, value.length)] = i;
            }
        }
    };
    UrlPreparator.prototype.produceUrl = function (options) {
        var url;
        if (this.hasWilds) {
            var clonedSplitted = this.splittedUrl.slice(0);
            for (var _i = 0, _a = Object.keys(options.wildValues); _i < _a.length; _i++) {
                var key = _a[_i];
                var index = this.wildsToIndexMap[key];
                clonedSplitted[index] = options.wildValues[key];
            }
            url = clonedSplitted.join("/");
        }
        else {
            url = this.url;
        }
        if (options && options.prefix) {
            url = options.prefix + "/" + url;
        }
        if (options && options.queryParams) {
            var queryString = ObjectToQueryStringSerializer_1.ObjectToQueryStringSerializer.serialize(options.queryParams);
            if (queryString) {
                if (UrlPreparator.containsQueryStringDelimiter(url)) {
                    url = url + "&" + queryString;
                }
                else {
                    url = url + "?" + queryString;
                }
            }
        }
        return url;
    };
    UrlPreparator.containsQueryStringDelimiter = function (url) {
        return url.indexOf("?") > -1;
    };
    return UrlPreparator;
}());
var ApiEndpointHandler = /** @class */ (function () {
    function ApiEndpointHandler(options) {
        var _this = this;
        this.wildsThatAreSetFromSameNamedMethod = {};
        this.options = options;
        this.urlPreparator = new UrlPreparator(options.url);
        if (options.defaultWilds) {
            options.defaultWilds.forEach(function (it) {
                _this.wildsThatAreSetFromSameNamedMethod[it] = true;
            });
        }
    }
    ApiEndpointHandler.prototype.produceUrl = function (caller, providedWilds, prefix, queryParams) {
        var wildValues = null;
        if (this.urlPreparator.hasWilds) {
            wildValues = this.populateWildValues(caller, providedWilds);
        }
        return this.urlPreparator.produceUrl({ wildValues: wildValues, prefix: prefix, queryParams: queryParams });
    };
    ApiEndpointHandler.prototype.populateWildValues = function (model, wilds) {
        var wildValues = {};
        for (var _i = 0, _a = Object.keys(this.urlPreparator.wildsToIndexMap); _i < _a.length; _i++) {
            var key = _a[_i];
            if (wilds && wilds[key]) {
                wildValues[key] = wilds[key];
            }
            else if (this.wildsThatAreSetFromSameNamedMethod[key]) {
                wildValues[key] = model[key];
            }
            else {
                throw "IllegalStateException: wild: " + key + " is not set explicitly, and is not sourced from method";
            }
        }
        return wildValues;
    };
    return ApiEndpointHandler;
}());
function ApiEndpoint(httpMethod, options) {
    return function (target, propertyName) {
        var apiEndpointHandler = new ApiEndpointHandler(options);
        var requestFunction = function (options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var rootResolve, rootReject, requestResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options.caller = this;
                            options.url = apiEndpointHandler.produceUrl(this, options.wilds, options.prefix, options.queryParams);
                            options.httpMethod = httpMethod;
                            if (!options.resolveWithJson) {
                                options.resolveWithJson = true;
                            }
                            if (this["before" + (propertyName.charAt(0).toUpperCase() + propertyName.slice(1)) + "Request"]) {
                                this["before" + (propertyName.charAt(0).toUpperCase() + propertyName.slice(1)) + "Request"](options);
                            }
                            if (this.hasFile) {
                                options.serializeAsForm = true;
                            }
                            options.httpMethod = httpMethod;
                            options.rootPromise = new Promise(function (resolve, reject) {
                                rootResolve = resolve;
                                rootReject = reject;
                            });
                            options.rootReject = rootReject;
                            options.rootResolve = rootResolve;
                            requestResult = index_1.XhrRequestMaker.create(options);
                            if (!options.yieldRawResponse) return [3 /*break*/, 2];
                            return [4 /*yield*/, requestResult];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            if (!this["after" + (propertyName.charAt(0).toUpperCase() + propertyName.slice(1)) + "Request"]) return [3 /*break*/, 4];
                            return [4 /*yield*/, this["after" + (propertyName.charAt(0).toUpperCase() + propertyName.slice(1)) + "Request"](options)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4: return [4 /*yield*/, requestResult];
                        case 5: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        target[propertyName] = requestFunction;
    };
}
exports.ApiEndpoint = ApiEndpoint;
