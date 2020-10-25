import {IRelationsConfig, IRelationsConfigEntry} from "../realtions/IRelationsConfig"
import {RelationTypesEnum} from "../RelationTypesEnum"
import {ModelSerializeArgs, serializationShared} from "./serializationShared"

/**
 * class responsible for deserializing plain js object to
 * T extends BaseModel
 */
export class ModelDeserializer {


    /**
     * for serializeOptions will add return value of it's key to result under same key
     * if key is decorated with HasMany or HasOne value of it be instantiated
     */
    deserializeModelData<T>(context: {
        relationsConfig: IRelationsConfig, modelData: any,
        serializeOptions?: ModelSerializeArgs<T>
    }) {
        const {relationsConfig, modelData, serializeOptions} = context
        const {exclude, include, doBlock} = serializeOptions ?? {}

        if (!modelData) {
            return {}
        }
        const result: any = {}

        /** defaults to all keys if no include if given */
        let propertyKeys: any[] = include ?? Object.keys(modelData)

        propertyKeys = serializationShared.filterOutKeysToExclude(propertyKeys, exclude)

        propertyKeys = serializationShared.filterOutDoBlockKeys(propertyKeys, doBlock)

        serializationShared.setDoBlockReturnValuesToResult(result, modelData, doBlock)

        for (let property of propertyKeys) {

            const rawValue = modelData[property]

            const relationEntry = relationsConfig[property]
            if (relationEntry) {
                const preparedValue = this.deserializeRelationValue(relationEntry, rawValue)
                property = relationEntry.aliasedTo ?? property
                result[property] = preparedValue
                continue
            }

            result[property] = rawValue
        }

        return result
    }

    deserializeRelationValue(relationsConfig: IRelationsConfigEntry, rawValue: any) {
        const thatConstructor = relationsConfig.getThatModelConstructor()

        switch (relationsConfig.associationType) {

            case RelationTypesEnum.hasMany:
                return rawValue?.map((it: any)=>{
                    if (it instanceof thatConstructor) {
                        return it
                    }
                    return new thatConstructor(it)
                })

            case RelationTypesEnum.hasOne:
                if (!rawValue) {
                    return rawValue
                }
                if (rawValue instanceof thatConstructor) {
                    return rawValue
                }
                return new thatConstructor(rawValue)
            }
    }


}

export const modelDeserializer = new ModelDeserializer()