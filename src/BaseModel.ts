import {IModelProperties} from './interfaces/IModelProperties';
import {ModelCollection} from './ModelCollection'
import {MixinSerializableTrait} from "./modelTraits/MixinSerializableTrait"
import {MixinValidatableTrait} from "./modelTraits/MixinValidatableTrait"
import {RequestOptions} from './decorators/ApiEndpoint'
import {IPagination} from "./utils/IPaginatedResponse"

class ModelClassMixinContainer {
    constructor(...args: Array<any>) {
    }
}

export class BaseModel extends MixinSerializableTrait(MixinValidatableTrait(ModelClassMixinContainer)) {
    properties!: IModelProperties;

    static reactKey = 0

    private reactKey!: number

    getReactKey = () => {
        this.reactKey = this.reactKey ?? (BaseModel.reactKey += 1)
        return this.reactKey
    }

    constructor(properties?: IModelProperties) {
        super(properties)
        this.init()
    }

    static jsonRoot = null

    getJsonRoot(): string {
        return (this.constructor as typeof BaseModel).jsonRoot as any
    }

    serialize(root: boolean = true): IModelProperties {
        let objectToReturn: IModelProperties = {}
        let propertiesCopy = {...(this.properties)}
        delete propertiesCopy.errors

        for (let key of Object.keys(propertiesCopy)) {
            let value = propertiesCopy[key]
            objectToReturn[key] = this.normalizeWhenSerializing(value, false)
        }
        if (root && this.getJsonRoot()) {
            let jsonRoot = this.getJsonRoot()
            let objectToReturnWithRoot: IModelProperties = {}
            objectToReturnWithRoot[jsonRoot] = objectToReturn
            return objectToReturnWithRoot
        } else {
            return objectToReturn
        }
    }

    normalizeWhenSerializing(value: any, root: boolean = false): any {
        if (value instanceof BaseModel) {
            return value.serialize(root)
        } else if (value instanceof ModelCollection) {
            let mapped = value.array.map((it) => {
                return (it as BaseModel).serialize(false)
            })
            return mapped
        } else {
            return value
        }
    }

    static async afterIndexRequest(options: RequestOptions): Promise<any> {
        const resp = await options.rootPromise
        let collection = new ModelCollection<BaseModel>()
        let returnedArray: Array<IModelProperties> = resp
        returnedArray.forEach((properties) => {
            collection.push(new this(properties))
        })
        return collection
    }

    static parsePaginated<T>(response: {result: any[], pagination: IPagination}) {
        let collection = new ModelCollection<BaseModel>()
        let returnedArray: Array<IModelProperties> = response.result
        returnedArray.forEach((properties) => {
            collection.push(new this(properties))
        })
        return {
            result: collection,
            pagination: response.pagination
        }
    }

    static async afterShowRequest(options: RequestOptions) {
        const response = await options.rootPromise
        let modelToReturn = new this(response)
        modelToReturn.validate()
        return modelToReturn
    }

    static async afterNewRequest(options: RequestOptions) {
        const response = await options.rootPromise
        return new this(response)

    }

    static afterEditRequest(options: RequestOptions) {
        this.afterShowRequest(options)
    }

    beforeUpdateRequest(options: RequestOptions) {
        this.beforeCreateRequest(options)
    }

    async afterUpdateRequest(options: RequestOptions) {
        return this.afterCreateRequest(options)
    }

    beforeCreateRequest(options: RequestOptions) {
        options.payload = this.serialize()
    }

    async afterCreateRequest(options: RequestOptions) {
        const response = await options.rootPromise
        let modelToReturn = new (this.constructor as any)(response)
        modelToReturn.validate()
        return modelToReturn
    }

    beforeDeleteRequest(options: RequestOptions) {
        this.beforeUpdateRequest(options)
    }

    afterDeleteRequest(options: RequestOptions) {
        this.afterUpdateRequest(options)
    }

    beforeDestroyRequest(options: RequestOptions) {
        this.beforeUpdateRequest(options)
    }

    afterDestroyRequest(options: RequestOptions) {
        this.afterUpdateRequest(options)
    }

} 