export type IModelSerializerDoBlockParam<T> = { [id in keyof T]?: (it: any) => any }

export interface ModelSerializeArgs<T extends {}> {
    include?: (keyof T)[],
    exclude?: (keyof T)[],
    withErrors?: boolean
    doBlock?: IModelSerializerDoBlockParam<T>
}

class SerializationShared {

    /** @see serialize */
    filterOutKeysToExclude<T>(keysToIncludeInResult: any[], exclude: (keyof T)[] | undefined) {
        if (!exclude) {
            return keysToIncludeInResult
        }
        return keysToIncludeInResult.filter((it: any)=>{
            return exclude.indexOf(it) < 0
        })
    }

    /**
     * @see serialize
     */
    filterOutDoBlockKeys<T>(keysToIncludeInResult: any[], doBlock?: IModelSerializerDoBlockParam<T>) {
        if (!doBlock) {
            return keysToIncludeInResult
        }
        const doBlockKeys = Object.keys(doBlock)
        return keysToIncludeInResult.filter((it: any)=>{
            return doBlockKeys.indexOf(it) < 0
        })
    }

    /**
     * values of do block assigned to result yielding current value on modelData to func,
     * if doBlock return value for key is undefined - it is not included into result object
     * */
    setDoBlockReturnValuesToResult<T>(
        result: any,
        modelData: any,
        doBlock?: IModelSerializerDoBlockParam<T>,
    ) {
        if (!doBlock) {
            return
        }

        for (let key of Object.keys(doBlock)) {
            const value = modelData[key]
            const replaceValue = (doBlock as any)[key](value)
            if (replaceValue === undefined) {
                continue
            }
            result[key] = replaceValue
        }
    }


}
export const serializationShared = new SerializationShared()
