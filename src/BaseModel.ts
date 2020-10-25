import {IModelData} from './interfaces/IModelData'
import {ModelValidator} from "./validation/ModelValidator"
import {IRelationsConfig} from "./realtions/IRelationsConfig"
import {modelDeserializer} from "./serialization/ModelDeserializer"
import {modelSerializer} from "./serialization/ModelSerializer"
import {IRequestOptions} from "./apihandling/IRequestOptions"
import {IPagination} from "./utils/IPaginatedResponse"
import {ModelSerializeArgs} from "./serialization/serializationShared"
import {modelMerger} from "./serialization/ModelMerger"

export class BaseModel {

    /**
     * core of your model
     * plain object that keeps modelData required for your business
     * class modelData annotated with
     * @see Property will get set values here directly under same key
     * accessing `modelData` directly is discouraged
     * */
    modelData!: IModelData;

    /**
     * will be lazily initialized in getter
     * @see validator
     */
    _validator?: any

    /**
     * just invokes constructor passing the modelData,
     * additionally gives you a typings for serializeOptions.
     * first arg some weird shit to get typing of static "this" so to say :)
     * */
    static deserialize<T>(this: new () => T, modelData?: any, serializeOptions?: ModelSerializeArgs<T>): T {
        return new (this as any)(modelData, serializeOptions) as T
    }

    constructor(modelData?: any, serializeOptions?: ModelSerializeArgs<any>) {
        /** @see ModelDeserializer */
        this.deserializeModelData(modelData, serializeOptions)
    }

    private deserializeModelData(modelData?: any, serializeOptions?: ModelSerializeArgs<this>) {
        /** @see ModelDeserializer */
        this.modelData = modelDeserializer.deserializeModelData({
            relationsConfig: (this.constructor as typeof BaseModel).getRelationsConfig(),
            modelData: modelData,
            serializeOptions: serializeOptions
        })
    }

    /**
     * just a shortcut so you don't access via modelData.errors
     */
    get errors() {
        return this.modelData.errors
    }

    set errors(value) {
        this.modelData.errors = value
    }

    /**
     * lazily intializes validator
     * by default will initialize base validator @see ModelValidator
     * to serializeOptions for usage with specific validator e.g. your AccountValidator
     * simply serializeOptions it with short implementation
     * e.g.
     * get validator() {return this._validator ??= new AccountValidator(this)}
     */
    get validator(): ModelValidator<any, any> {
        return this._validator ??= new ModelValidator(this)
    }

    /** @see getRelationsConfig */
    static relationsConfig: IRelationsConfig | null = null

    /**
     * required for hydrating related entities.
     * @see HasMany, HasOne will populate this config, so later
     * it be used during de/serialization
     * as well in other contexts.
     * e.g. will allow understand if property 'foo' is relation
     * and get required metadata for such relation
     */
    static getRelationsConfig(): IRelationsConfig {
        let config = this.relationsConfig
        if (!config) {
            this.relationsConfig = {}
        }
        return this.relationsConfig!
    }

    /**
     * @see ModelSerializer
     */
    serialize(options: ModelSerializeArgs<this> = {}) {
        return modelSerializer.serialize(
            this, (this.constructor as typeof BaseModel).getRelationsConfig(), options
        )
    }

    /**
     * used in component based ui libs
     * as well as when you need a unique key associated with this instance
     * p.s unique in sense among T extends BaseModel instances in current process
     */
    static uniqueKey = 0
    private uniqueKey!: number
    getUniqueKey = () => {
        this.uniqueKey = this.uniqueKey ?? (BaseModel.uniqueKey += 1)
        return this.uniqueKey
    }

    /**
     * utility method - to be used after response
     * deserializes response data to array of this instances
     */
    static async handleCollectionResponse(options: IRequestOptions): Promise<any> {
        const data = (await options.rootPromise!).data
        return data!.map((modelData: any) => {
            return new this(modelData)
        })
    }

    /**
     * utility method - to be used after response
     * deserializes response data to instance of this
     */
    static async handleSingleResponse(options: IRequestOptions) {
        const response = (await options.rootPromise!).data
        return new this(response)
    }

    /**
     * utility method to deserializing paginated response
     */
    static parsePaginated<T>(response: {result: any[], pagination: IPagination}) {
        let returnedArray: Array<IModelData> = response.result
        let collection: BaseModel[] = returnedArray.map((modelData) => {
            return new this(modelData)
        })
        return {
            result: collection,
            pagination: response.pagination
        }
    }

    /**
     * utility method - sets serialized this on request options
     */
    serializeToRequestData(options: IRequestOptions) {
        options.data = this.serialize()
    }

    replaceErrorsFrom<T extends BaseModel>(thatModel: T) {
        modelMerger.replaceWithErrorsFrom(this, thatModel)
    }

}