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
Object.defineProperty(exports, "__esModule", { value: true });
var ModelSerializer_1 = require("../ModelSerializer");
function MixinSerializableTrait(Base) {
    var _a;
    return _a = /** @class */ (function (_super) {
            __extends(SerializableTrait, _super);
            function SerializableTrait() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.call(this, args) || this;
                args = args[0];
                var properties = _this.parsePropertes(args);
                _this.properties = properties;
                return _this;
            }
            SerializableTrait.prototype.getStaticAssociationsConfig = function () {
                return this.constructor.getAssociationsConfig();
            };
            SerializableTrait.getAssociationsConfig = function () {
                var config = this.associationsConfig;
                if (!config) {
                    config = {};
                    this.associationsConfig = config;
                }
                return config;
            };
            SerializableTrait.prototype.init = function (properties) {
            };
            SerializableTrait.prototype.parsePropertes = function (properties) {
                if (properties) {
                    return ModelSerializer_1.ModelSerializer.parseFromConstructor(properties, this.getStaticAssociationsConfig());
                }
                else {
                    return {};
                }
            };
            SerializableTrait.prototype.mergeProperties = function (properties) {
                this.properties = __assign(__assign({}, (this.properties)), properties);
            };
            SerializableTrait.prototype.mergeWith = function (model) {
                this.properties = __assign(__assign({}, (this.properties)), (model.properties));
                this.errors = model.errors;
            };
            return SerializableTrait;
        }(Base)),
        _a.associationsConfig = null,
        _a;
}
exports.MixinSerializableTrait = MixinSerializableTrait;
