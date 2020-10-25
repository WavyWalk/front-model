import axios, { AxiosError } from 'axios'
import {IRequestOptions} from ".."

function axiosType() {
    return axios.create()
}

export class FrontModelConfig {
    axiosInstance!: ReturnType<typeof axiosType>
    defaultRequestOptions: IRequestOptions = {}
    beforeRequestOptionsHandler?: (options: IRequestOptions) => IRequestOptions
    onFailHandler?: (error: AxiosError) => any
    executeOnRequestStart?: (options?: IRequestOptions) => any
    executeOnRequestEnd?: (options?: IRequestOptions) => any

    constructor() {
        this.setDefaultAxiosInstance()
    }

    setDefaultAxiosInstance() {
        this.axiosInstance = axios.create(this.defaultRequestOptions)
    }

}

export const frontModelConfig = new FrontModelConfig()