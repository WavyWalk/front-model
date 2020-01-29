import {BaseModel} from "../BaseModel"
import {IModelProperties} from '../interfaces/IModelProperties';
import {XhrRequestMaker} from '../index';


export interface RequestOptions {
    url?: string,
    method?: string,
    caller?: BaseModel,
    wilds?: { [id: string]: string }
    yieldRawResponse?: boolean,
    urlPrefix?: string,
    extraParams?: IModelProperties,
    serializeAsForm?: boolean,
    arbitrary?: any,
    params?: IModelProperties,
    responseType?: string,
    prefix?: string,
    requestHeaders?: { [id: string]: any } | null,
    httpMethod?: string,
    resolveWithJson?: boolean,
    rootPromise?: Promise<any>,
    rootResolve?: (...args: any[]) => any,
    rootReject?: ((...args: any[]) => any),
}


class UrlPreparator {
    hasWilds!: boolean
    wildsToIndexMap: { [id: string]: number } = {}
    splittedUrl: Array<string>
    url: string

    constructor(url: string) {
        this.splittedUrl = url.split("/")
        this.url = url
        this.prepareWildsToIndexMap()
    }

    private prepareWildsToIndexMap() {
        for (let i = 0; i < this.splittedUrl.length; i++) {
            let value = this.splittedUrl[i]
            if (value[0] === ":") {
                this.hasWilds = true
                this.wildsToIndexMap[value.substring(1, value.length)] = i
            }
        }
    }

    produceUrl(options?: { wildValues?: { [id: string]: any } | null, prefix?: string }): string {
        let url: string | undefined

        if (this.hasWilds) {
            let clonedSplitted = this.splittedUrl.slice(0)
            for (let key of Object.keys(options!.wildValues!)) {
                let index = this.wildsToIndexMap[key]
                clonedSplitted[index] = options!.wildValues![key]
            }
            url = clonedSplitted.join("/")
        } else {
            url = this.url
        }

        if (options && options.prefix) {
            url = `${options.prefix}/${url}`
        }

        return url
    }

}

interface ApiEndpointOptions {
    url: string,
    defaultWilds?: Array<string>
}

class ApiEndpointHandler {
    options: ApiEndpointOptions
    urlPreparator: UrlPreparator
    wildsThatAreSetFromSameNamedMethod: { [id: string]: boolean } = {}

    constructor(options: ApiEndpointOptions) {
        this.options = options

        this.urlPreparator = new UrlPreparator(options.url)

        if (options.defaultWilds) {
            options.defaultWilds.forEach((it) => {
                this.wildsThatAreSetFromSameNamedMethod[it] = true
            })
        }

    }

    produceUrl(
        caller: BaseModel,
        providedWilds?: { [id: string]: any },
        prefix?: string
    ): string {
        if (this.urlPreparator.hasWilds) {
            let wildValues = this.populateWildValues(caller, providedWilds!)
            return this.urlPreparator.produceUrl({wildValues, prefix})
        } else {
            return this.urlPreparator.produceUrl({wildValues: null, prefix})
        }
    }

    private populateWildValues(
        model: BaseModel,
        wilds: { [id: string]: any }
    ): { [id: string]: string } {
        let wildValues: { [id: string]: any } = {}

        for (let key of Object.keys(this.urlPreparator.wildsToIndexMap)) {
            if (wilds && wilds[key]) {
                wildValues[key] = wilds[key]
            } else if (this.wildsThatAreSetFromSameNamedMethod[key]) {
                wildValues[key] = (model as any)[key]
            } else {
                throw `IllegalStateException: wild: ${key} is not set explicitly, and is not sourced from method`
            }
        }
        return wildValues
    }
}


export function ApiEndpoint(httpMethod: string, options: ApiEndpointOptions) {

    return function (target: BaseModel | typeof BaseModel, propertyName: string) {

        let apiEndpointHandler = new ApiEndpointHandler(options)

        let requestFunction = async function (this: BaseModel | any, options: RequestOptions = {}): Promise<any> {

                let beforeRequestFunc = this[`before${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}Request`]

                let afterRequestFunc = this[`after${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}Request`]

                options.caller = this
                options.url = apiEndpointHandler.produceUrl(this, options.wilds, options.prefix)
                options.httpMethod = httpMethod

                if (!options.resolveWithJson) {
                    options.resolveWithJson = true
                }

                if (beforeRequestFunc) {
                    this[`before${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}Request`](options)
                }
                if (this.hasFile) {
                    options.serializeAsForm = true
                }

                options.httpMethod = httpMethod
                if (options.serializeAsForm) {
                    options.requestHeaders = null
                }

                let rootResolve!: (...args: any[])=>any
                let rootReject!: (...args: any[])=>any

                options.rootPromise = new Promise((resolve, reject)=>{
                    rootResolve = resolve
                    rootReject = reject
                })

                options.rootReject = rootReject
                options.rootResolve = rootResolve

                const requestResult = XhrRequestMaker.create(options as RequestOptions)

                if (options.yieldRawResponse) {
                    return await requestResult
                }

                if (afterRequestFunc) {
                    return await this[`after${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}Request`](options as RequestOptions)
                }

                return await requestResult
            }

        ;(target as any)[propertyName] = requestFunction

    }
}

