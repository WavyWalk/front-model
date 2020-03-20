"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssociationTypesEnum_1 = require("../AssociationTypesEnum");
var ModelCollection_1 = require("../ModelCollection");
var ModelRegistry_1 = require("../ModelRegistry");
function HasMany(stringifiedClassName, parseAliases, thatConstructor) {
    if (parseAliases === void 0) { parseAliases = null; }
    return function (target, propertyName) {
        var get = function () {
            //@ts-ignore
            var valueAtProperty = this.properties[propertyName];
            if (valueAtProperty == null) {
                var defaultValue = new ModelCollection_1.ModelCollection();
                //@ts-ignore
                this[propertyName] = defaultValue;
                return defaultValue;
            }
            else {
                return valueAtProperty;
            }
        };
        var set = function (valueToSet) {
            //@ts-ignore
            this.properties[propertyName] = valueToSet;
        };
        var associationsConfig = target.constructor.getAssociationsConfig();
        var associationsConfigEntry = {
            associationType: AssociationTypesEnum_1.AssociationTypesEnum.hasMany,
            getThatModelConstructor: ModelRegistry_1.ModelRegistry.modelGetterFuntion(stringifiedClassName),
            aliasedTo: null
        };
        associationsConfig[propertyName] = associationsConfigEntry;
        if (parseAliases) {
            parseAliases.forEach(function (alias) {
                var configEntryForAlias = {
                    associationType: AssociationTypesEnum_1.AssociationTypesEnum.hasMany,
                    getThatModelConstructor: ModelRegistry_1.ModelRegistry.modelGetterFuntion(stringifiedClassName),
                    aliasedTo: propertyName
                };
                associationsConfig[alias] = configEntryForAlias;
            });
        }
        Object.defineProperty(target, propertyName, {
            get: get,
            set: set
        });
    };
}
exports.HasMany = HasMany;
