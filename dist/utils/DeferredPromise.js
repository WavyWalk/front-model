"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DefferedPromise = /** @class */ (function () {
    function DefferedPromise() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.innerResolve = resolve;
            _this.innerReject = reject;
        });
        this.lastThen = this.promise;
    }
    DefferedPromise.prototype.resolve = function (value) {
        this.innerResolve(value);
    };
    DefferedPromise.prototype.reject = function (reason) {
        this.innerReject(reason);
    };
    DefferedPromise.prototype.getPromise = function () {
        return this.promise;
    };
    DefferedPromise.prototype.then = function (callback) {
        this.lastThen = this.lastThen.then(callback);
        return this.lastThen;
    };
    DefferedPromise.prototype.catch = function (callback) {
        this.lastThen = this.lastThen.catch(callback);
        return this.lastThen;
    };
    return DefferedPromise;
}());
exports.DefferedPromise = DefferedPromise;
