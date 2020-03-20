"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelRegistry = /** @class */ (function () {
    function ModelRegistry() {
    }
    ModelRegistry.register = function (stringifiedClassName, model) {
        console.log("registering " + stringifiedClassName);
        this.registeredModels[stringifiedClassName] = model;
    };
    ModelRegistry.get = function (key) {
        return this.registeredModels[key];
    };
    ModelRegistry.modelGetterFuntion = function (key) {
        return function () {
            return ModelRegistry.get(key);
        };
    };
    ModelRegistry.registeredModels = {};
    return ModelRegistry;
}());
exports.ModelRegistry = ModelRegistry;
