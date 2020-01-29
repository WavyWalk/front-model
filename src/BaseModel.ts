import {ModelSerializer} from './ModelSerializer';
import {IModelProperties} from './interfaces/IModelProperties';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {IAssociationsConfig} from './interfaces/IAssociationsConfig';
import {ModelCollection} from './ModelCollection'
import {MixinSerializableTrait} from "./modelTraits/MixinSerializableTrait"
import {MixinValidatableTrait} from "./modelTraits/MixinValidatableTrait"
import {RequestOptions} from './annotations/ApiEndpoint'

class ModelClassMixinContainer {
    constructor(...args: Array<any>) {
    }
}


export class BaseModel extends MixinSerializableTrait(MixinValidatableTrait(ModelClassMixinContainer)) {
    properties!: IModelProperties;

    constructor(properties?: IModelProperties) {
        super(properties)
        this.init()
    }

    static jsonRoot = null

    getJsonRoot(): string {
        return (this.constructor as typeof BaseModel).jsonRoot as any
    }


    getPureProperties(root: boolean = true): IModelProperties {
        let objectToReturn: IModelProperties = {}
        let propertiesCopy = {...(this.properties)}
        delete propertiesCopy.errors

        for (let key of Object.keys(propertiesCopy)) {
            let value = propertiesCopy[key]
            objectToReturn[key] = this.normalizeWhenGettingPureProperties(value, false)
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

    normalizeWhenGettingPureProperties(value: any, root: boolean = false): any {
        if (value instanceof BaseModel) {
            return value.getPureProperties(root)
        } else if (value instanceof ModelCollection) {
            let mapped = value.array.map((it) => {
                return (it as BaseModel).getPureProperties(false)
            })
            return mapped
        } else {
            return value
        }
    }


    isPlainObject(obj: any): boolean {

        // Basic check for Type object that's not null
        if (typeof obj == 'object' && obj !== null) {

            // If Object.getPrototypeOf supported, use it
            if (typeof Object.getPrototypeOf == 'function') {
                var proto = Object.getPrototypeOf(obj);
                return proto === Object.prototype || proto === null;
            }

            // Otherwise, use internal class
            // This should be reliable as if getPrototypeOf not supported, is pre-ES5
            return Object.prototype.toString.call(obj) == '[object Object]';
        }

        // Not an object
        return false;
    }

    static async afterIndexRequest(options: RequestOptions) {
        const resp = await options.rootPromise
        let collection = new ModelCollection<BaseModel>()
        let returnedArray: Array<IModelProperties> = resp
        returnedArray.forEach((properties) => {
            collection.push(new this(properties))
        })
        return collection
    }


    static afterGetRequest(options: RequestOptions) {
        options.rootPromise!.then((resp) => {
            return new this(resp)
        })
    }

    static afterShowRequest(options: RequestOptions) {
        options.rootPromise!.then((resp) => {
            return Promise.resolve(new this(resp))
        })
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

    afterUpdateRequest(options: RequestOptions) {
        this.afterCreateRequest(options)
    }

    beforeCreateRequest(options: RequestOptions) {
        options.params = this.getPureProperties()
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