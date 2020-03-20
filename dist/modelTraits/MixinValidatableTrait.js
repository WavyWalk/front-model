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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ModelCollection_1 = require("../ModelCollection");
function MixinValidatableTrait(Base) {
    return /** @class */ (function (_super) {
        __extends(ValidatableTrait, _super);
        function ValidatableTrait() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.hasFile = false;
            return _this;
        }
        ValidatableTrait.prototype.getErrorsFor = function (propertyName) {
            if (this.errors) {
                return this.errors[propertyName];
            }
            else {
                return undefined;
            }
        };
        ValidatableTrait.prototype.getFirstErrorFor = function (propertyName) {
            var _a;
            return (_a = this.getErrorsFor(propertyName)) === null || _a === void 0 ? void 0 : _a[0];
        };
        ValidatableTrait.prototype.removeErrorsFor = function (propertyName) {
            if (this.errors) {
                delete this.errors[propertyName];
            }
        };
        ValidatableTrait.prototype.addErrorFor = function (propertyName) {
            var errorsToAdd = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                errorsToAdd[_i - 1] = arguments[_i];
            }
            if (this.errors) {
                var errors = this.errors[propertyName];
                if (errors) {
                    errors.push.apply(errors, errorsToAdd);
                }
                else {
                    this.errors[propertyName] = errorsToAdd;
                }
            }
            else {
                this.errors = {};
                this.errors[propertyName] = errorsToAdd;
            }
        };
        ValidatableTrait.prototype.replaceErrorFor = function (propertyName) {
            var errorsToAdd = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                errorsToAdd[_i - 1] = arguments[_i];
            }
            if (this.errors) {
                var errors = this.errors[propertyName];
                this.errors[propertyName] = errorsToAdd;
            }
            else {
                this.errors = {};
                this.errors[propertyName] = errorsToAdd;
            }
        };
        ValidatableTrait.prototype.removeHasNestedErrorsFlag = function () {
        };
        ValidatableTrait.prototype.removeSpecificErrorFrom = function (propertyName, error) {
            var errors = this.getErrorsFor(propertyName);
            if (!errors) {
                return;
            }
            var index = errors.indexOf(error);
            if (index < 0) {
                return;
            }
            errors.splice(index, 1);
        };
        ValidatableTrait.prototype.containsSpecificError = function (propertyName, errorText) {
            var errors = this.getErrorsFor(propertyName);
            if (errors) {
                for (var index = 0; index < errors.length; index++) {
                    if ("" + errorText === "" + errors[index]) {
                        return true;
                    }
                }
            }
            return false;
        };
        ValidatableTrait.prototype.validate = function (options) {
            var _this = this;
            var _a, _b;
            this.errors = undefined;
            var propertiesToValidate = Object.keys(this.properties);
            if ((_a = options) === null || _a === void 0 ? void 0 : _a.validateOnly) {
                propertiesToValidate = options.validateOnly;
            }
            else if ((_b = options) === null || _b === void 0 ? void 0 : _b.exclude) {
                propertiesToValidate = propertiesToValidate.filter(function (it) { return !options.exclude.includes(it); });
            }
            for (var _i = 0, propertiesToValidate_1 = propertiesToValidate; _i < propertiesToValidate_1.length; _i++) {
                var key = propertiesToValidate_1[_i];
                var value = this.properties[key];
                var validator = this[key + "Validator"];
                if (validator) {
                    this[key + "Validator"]();
                    continue;
                }
                if (value instanceof ModelCollection_1.ModelCollection) {
                    value.forEach(function (it) {
                        it.validate();
                        _this.hasFile = it.hasFile;
                    });
                    continue;
                }
                if (value instanceof ValidatableTrait) {
                    value.validate();
                    this.hasFile = value.hasFile;
                    if (!value.isValid()) {
                        this.addErrorFor("nestedErrors", key);
                    }
                    continue;
                }
            }
            var errors = this.properties.errors;
            if (errors) {
                Object.keys(errors).forEach(function (key) {
                    _this.addErrorFor.apply(_this, __spreadArrays([key], errors[key]));
                });
            }
            this.properties.errors = undefined;
        };
        ValidatableTrait.prototype.isValid = function () {
            if (this.errors) {
                return false;
            }
            else {
                return true;
            }
        };
        ValidatableTrait.prototype.resetErrors = function () {
            this.errors = null;
            this.hasFile = false;
            for (var _i = 0, _a = Object.keys(this.properties); _i < _a.length; _i++) {
                var key = _a[_i];
                var value = this.properties[key];
                if (value instanceof ModelCollection_1.ModelCollection) {
                    value.forEach(function (it) {
                        it.resetErrors();
                    });
                }
                else if (value instanceof ValidatableTrait) {
                    value.resetErrors();
                }
            }
        };
        ValidatableTrait.prototype.validateIfNotBlank = function (propertyName, errorMessage) {
            var propertyValue = this[propertyName];
            this.removeErrorsFor(propertyName);
            if (!propertyValue) {
                this.addErrorFor(propertyName, errorMessage);
            }
        };
        return ValidatableTrait;
    }(Base));
}
exports.MixinValidatableTrait = MixinValidatableTrait;
