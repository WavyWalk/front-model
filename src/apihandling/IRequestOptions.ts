import { AxiosRequestConfig, AxiosResponse } from "axios"
import {BaseModel} from "../BaseModel"
import {IModelData} from "../interfaces/IModelData"
import axios from 'axios'

export type IUrlParams = { [id: string]: string|number|any }

/** to access and use axios types */
const __axiosRequestConfig__ = null as any as AxiosRequestConfig

export type IAxiosRequestConfig = typeof __axiosRequestConfig__

export type IHttpMethod = typeof __axiosRequestConfig__.method

export interface IFrontModelRequestOptions {
    caller?: BaseModel
    urlParams?: IUrlParams
    toMergeWithData?: IModelData
    serializeAsForm?: boolean
    arbitraryContext?: any
    rootPromise?: Promise<AxiosResponse>
    rootResolve?: (...args: any[]) => any
    rootReject?: ((...args: any[]) => any)
    rejectOnError?: boolean
    isLoadingToggle?: (value: boolean)=>any
    transformFinalUrl?: (url: string) => any
    yieldFinalOptions?: (options: IRequestOptions) => IRequestOptions
}

export type IRequestOptions = IFrontModelRequestOptions & IAxiosRequestConfig