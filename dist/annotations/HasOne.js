"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssociationTypesEnum_1 = require("../AssociationTypesEnum");
var ModelRegistry_1 = require("../ModelRegistry");
function HasOne(stringifiedClassName, parseAliases) {
    if (parseAliases === void 0) { parseAliases = null; }
    return function (target, propertyName) {
        var getter = function () {
            //@ts-ignore
            return this.properties[propertyName];
        };
        var setter = function (valueToAssign) {
            //@ts-ignore
            this.properties[propertyName] = valueToAssign;
        };
        //get static associationsConfig or assign if undefined
        var associationsConfig = target.constructor.getAssociationsConfig();
        var associationsConfigEntry = {
            associationType: AssociationTypesEnum_1.AssociationTypesEnum.hasOne,
            getThatModelConstructor: ModelRegistry_1.ModelRegistry.modelGetterFuntion(stringifiedClassName),
            aliasedTo: null
        };
        associationsConfig[propertyName] = associationsConfigEntry;
        if (parseAliases) {
            //create entry for alis, so when parsing it defines that model correctly
            //but assigns to the properties under key to which it is aliased
            parseAliases.forEach(function (alias) {
                var associationsConfigEntryForAlias = {
                    associationType: AssociationTypesEnum_1.AssociationTypesEnum.hasOne,
                    getThatModelConstructor: ModelRegistry_1.ModelRegistry.modelGetterFuntion(stringifiedClassName),
                    aliasedTo: propertyName
                };
                associationsConfig[alias] = associationsConfigEntryForAlias;
            });
        }
        Object.defineProperty(target, propertyName, {
            get: getter,
            set: setter
        });
    };
}
exports.HasOne = HasOne;
