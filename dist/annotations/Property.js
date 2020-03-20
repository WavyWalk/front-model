"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Property(target, propertyName) {
    var getter = function () {
        //@ts-ignore
        return this.properties[propertyName];
    };
    var setter = function (valueToassign) {
        //@ts-ignore
        this.properties[propertyName] = valueToassign;
    };
    Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter
    });
}
exports.Property = Property;
