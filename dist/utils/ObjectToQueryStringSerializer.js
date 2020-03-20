"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectToQueryStringSerializer = /** @class */ (function () {
    function ObjectToQueryStringSerializer() {
    }
    ObjectToQueryStringSerializer.serialize = function (objectToSerialize) {
        if (!objectToSerialize) {
            return null;
        }
        return this.serializeLevel(objectToSerialize);
    };
    ObjectToQueryStringSerializer.serializeLevel = function (objectToSerialize, pathAccumulator) {
        if (pathAccumulator === void 0) { pathAccumulator = null; }
        var result = [];
        for (var property in objectToSerialize) {
            if (objectToSerialize.hasOwnProperty(property)) {
                var propertyPath = pathAccumulator ? pathAccumulator + "[" + property + "]" : property;
                var value = objectToSerialize[property];
                result.push((value !== null && typeof value === "object")
                    ? this.serializeLevel(value, propertyPath)
                    : encodeURIComponent(propertyPath) + "=" + encodeURIComponent(value));
            }
        }
        return result.join("&");
    };
    return ObjectToQueryStringSerializer;
}());
exports.ObjectToQueryStringSerializer = ObjectToQueryStringSerializer;
