"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelCollection = /** @class */ (function () {
    function ModelCollection() {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        this.array = values;
    }
    ModelCollection.prototype.push = function (value) {
        this.array.push(value);
    };
    ModelCollection.prototype.pop = function (value) {
        this.array.pop();
    };
    ModelCollection.prototype.forEach = function (lambda) {
        this.array.forEach(function (value) {
            lambda(value);
        });
    };
    ModelCollection.prototype.map = function (callback) {
        return this.array.map(callback);
    };
    ModelCollection.prototype.isNotEmpty = function () {
        return (this.array.length > 0);
    };
    ModelCollection.prototype.filterInPlace = function (lambda) {
        this.array = this.array.filter(lambda);
    };
    return ModelCollection;
}());
exports.ModelCollection = ModelCollection;
