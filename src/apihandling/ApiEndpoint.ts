import {BaseModel} from "../BaseModel"
import {IApiEndpointDecoratorOptions} from "./IApiEndpointDecoratorOptions"
import {endpointUrlFactory} from "./EndpointUrlFactory"
import {IHttpMethod, IRequestOptions} from "./IRequestOptions"
import {apiRequest} from "./ApiRequest"
import { AxiosResponse } from "axios"


export type MakeRequest = () => Promise<AxiosResponse>

export function ApiEndpoint(httpMethod: IHttpMethod, urlOptions: IApiEndpointDecoratorOptions) {

    return function (target: BaseModel | typeof BaseModel, propertyName: string, descriptor: PropertyDescriptor): any {

        const originalFunction = descriptor!.value

        let requestFunction = async function (
            this: BaseModel | any, options: IRequestOptions = {}
        ): Promise<any> {

            options.caller = this
            options.url = endpointUrlFactory.make(urlOptions.url, options.urlParams, options.transformFinalUrl)

            options.method = httpMethod

            let rootResolve!: (...args: any[])=>any
            let rootReject!: (...args: any[])=>any

            const makeRequest: MakeRequest = async () => {
                options.rootPromise = new Promise((resolve, reject)=>{
                    rootResolve = resolve
                    rootReject = reject
                })
                options.rootReject = rootReject
                options.rootResolve = rootResolve
                apiRequest.create(options)
                return options.rootPromise
            }
            return await originalFunction.apply(this, [options, makeRequest])
        }

        descriptor.value = requestFunction

        return descriptor
    }
}
