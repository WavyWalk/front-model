"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelCollection_1 = require("./ModelCollection");
var BaseModel_1 = require("./BaseModel");
var AssociationTypesEnum_1 = require("./AssociationTypesEnum");
var ModelSerializer = /** @class */ (function () {
    function ModelSerializer() {
    }
    ModelSerializer.parseCollection = function (modelConstructor, propertiesArray) {
        var collectionToReturn = new ModelCollection_1.ModelCollection();
        for (var _i = 0, propertiesArray_1 = propertiesArray; _i < propertiesArray_1.length; _i++) {
            var properties = propertiesArray_1[_i];
            collectionToReturn.push(new modelConstructor(properties));
        }
        return collectionToReturn;
    };
    ModelSerializer.parseFromConstructor = function (properties, associationsConfig) {
        var parsedProperties = {};
        for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = properties[key];
            if (value instanceof BaseModel_1.BaseModel) {
                parsedProperties[key] = value;
                continue;
            }
            if (associationsConfig[key]) {
                this.parseAssociatedFromConstructor(parsedProperties, associationsConfig[key], key, value);
            }
            else {
                parsedProperties[key] = value;
            }
        }
        return parsedProperties;
    };
    ModelSerializer.parseAssociatedFromConstructor = function (parsedProperties, configEntry, key, value) {
        if (configEntry.aliasedTo) {
            key = configEntry.aliasedTo;
        }
        var associationType = configEntry.associationType;
        if (value) {
            var thatConstructor = configEntry.getThatModelConstructor();
            if (!thatConstructor) {
                console.log("WARNING: " + key + " is not registered at ModelRegistrator");
            }
            if (associationType === AssociationTypesEnum_1.AssociationTypesEnum.hasMany) {
                if (value instanceof ModelCollection_1.ModelCollection) {
                    parsedProperties[key] = value;
                }
                else {
                    parsedProperties[key] = this.parseCollectionOfBaseModel(configEntry.getThatModelConstructor(), value);
                }
            }
            if (associationType === AssociationTypesEnum_1.AssociationTypesEnum.hasOne) {
                parsedProperties[key] = this.parseSingleBaseModel(configEntry.getThatModelConstructor(), value);
            }
        }
        else {
            parsedProperties[key] = null;
        }
    };
    ModelSerializer.parseSingleBaseModel = function (modelConstructor, properties) {
        return new modelConstructor(properties);
    };
    ModelSerializer.parseCollectionOfBaseModel = function (modelConstructor, propertiesArray) {
        var collectionToReturn = new ModelCollection_1.ModelCollection();
        for (var _i = 0, propertiesArray_2 = propertiesArray; _i < propertiesArray_2.length; _i++) {
            var properties = propertiesArray_2[_i];
            var newModel = new modelConstructor(properties);
            collectionToReturn.push(newModel);
        }
        return collectionToReturn;
    };
    return ModelSerializer;
}());
exports.ModelSerializer = ModelSerializer;
