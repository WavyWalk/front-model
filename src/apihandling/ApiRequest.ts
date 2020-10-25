import {IModelData} from '../interfaces/IModelData';
import axios, {AxiosRequestConfig, AxiosPromise, AxiosError, AxiosResponse} from 'axios'
import {IRequestOptions} from "./IRequestOptions"
import {frontModelConfig} from "../config/FrontModelConfig"
import {toFormDataSerializer} from "../utils/ToFormDataSerializer"


export class ApiRequest {

    create(options: IRequestOptions): Promise<AxiosResponse> {
        options = this.prepareOptions(options)
        const axiosInstance = frontModelConfig.axiosInstance

        options = frontModelConfig.beforeRequestOptionsHandler?.(options)
            ?? options

        options = options.yieldFinalOptions?.(options)
            ?? options

        this.executeRequest(axiosInstance.request(options), options)
        return options.rootPromise!
    }

    prepareOptions(options: IRequestOptions) {
        options = this.mergeDefaultOptions(options)
        options = this.prepareHeaders(options)
        options = this.preparePayload(options)
        options.responseType = options.responseType ?? 'json'
        options.isLoadingToggle?.(true)
        return options
    }

    preparePayload(options: IRequestOptions) {
        if (options.toMergeWithData) {
            options.data = {...options.data, ...options.toMergeWithData}
        }

        if (!options.data) {
            return options
        }

        if (options.serializeAsForm) {
            options.data = toFormDataSerializer.serialize(options.data)
            return options
        }

        return options
    }

    async executeRequest(axiosPromise: AxiosPromise, options: IRequestOptions) {
        frontModelConfig.executeOnRequestStart?.(options)
        let response: AxiosResponse
        try {
            response = await axiosPromise
        } catch (e) {
            e = e as AxiosError
            this.handleFail(e, options)
            frontModelConfig.executeOnRequestEnd?.(response!)
            options.isLoadingToggle?.(false)
            return
        }
        options.isLoadingToggle?.(false)
        frontModelConfig.executeOnRequestEnd?.(response!)
        options.rootResolve!(response)
    }

    handleFail(e: AxiosError, options: IRequestOptions) {
        if (frontModelConfig.onFailHandler && !options.rejectOnError) {
            frontModelConfig.onFailHandler(e)
        }
        options.rootReject!(e)
    }

    prepareHeaders(options: IRequestOptions) {
        options.headers = options.headers ?? {}
        if (options.serializeAsForm) {
            return options
        }
        if (!options.headers?.['Content-Type']) {
            options.headers['Content-Type'] ='application/json'
        }
        return options
    }

    private mergeDefaultOptions(options: IRequestOptions) {
        const resultOptions = {...frontModelConfig.defaultRequestOptions}
        for (let key of Object.keys(options)) {
            resultOptions[key as keyof IRequestOptions] = options[key as keyof IRequestOptions]
        }
        return resultOptions
    }
}

export const apiRequest = new ApiRequest()