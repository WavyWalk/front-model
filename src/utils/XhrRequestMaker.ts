import {IModelProperties} from '../interfaces/IModelProperties';
import {RequestOptions} from '../annotations/ApiEndpoint'

export class XhrRequestMaker {

    static userDefinedRequestOptionsHandler: (options: RequestOptions) => void

    static onFailHandler: (xhr: XMLHttpRequest) => void

    static get(options: RequestOptions): Promise<any> {
        options.httpMethod = "GET"
        let requestMaker = new this(options)
        return requestMaker.rootPromise
    }

    static post(options: RequestOptions): Promise<any> {
        options.httpMethod = "POST"
        let requestMaker = new this(options)
        return requestMaker.rootPromise
    }

    static put<T>(options: RequestOptions): Promise<any> {
        options.httpMethod = "PUT"
        let requestMaker = new this(options)
        return requestMaker.rootPromise
    }

    static delete<T>(options: RequestOptions): Promise<any> {
        options.httpMethod = "DELETE"
        let requestMaker = new this(options)
        return requestMaker.rootPromise
    }

    static create(options: RequestOptions): Promise<any> {
        let requestMaker = new this(options)
        return requestMaker.rootPromise
    }

    rootPromise: Promise<any>
    xhr: XMLHttpRequest
    options: RequestOptions

    constructor(options: RequestOptions) {
        this.rootPromise = options.rootPromise as any
        this.options = options
        if (XhrRequestMaker.userDefinedRequestOptionsHandler) {
            XhrRequestMaker.userDefinedRequestOptionsHandler(this.options)
        }
        this.xhr = new XMLHttpRequest()

        if (this.options.extraParams) {
            this.options.params = {...this.options.params, ...this.options.extraParams}
        }

        this.setParameters()

        this.xhr.open(this.options.httpMethod as any, this.options.url as any)
        if (options.responseType) {
            (this.xhr as any).responseType = options.responseType
        }
        this.xhr.onprogress = function (e) {
            if (e.lengthComputable) {
            }
        }
        this.xhr.onloadstart = function (e) {
        }
        this.xhr.onloadend = function (e) {
        }
        this.setHeaders()
        this.setOnLoad()
        this.send()
    }

    send() {
        if (this.options.httpMethod != "GET" && this.options.params) {
            if (this.options.serializeAsForm) {
                this.xhr.send(this.createFormData(this.options.params))
            } else {
                this.xhr.send(JSON.stringify(this.options.params))
            }
        } else {
            this.xhr.send()
        }
    }

    setParameters() {
        let options = this.options
        if (options.httpMethod === "GET" && options.params) {
            options.url = `${options.url}?${this.objectToQueryString(options.params)}`
        }
    }

    setOnLoad() {
        this.xhr.onload = () => {
            if (this.options.yieldRawResponse) {
                this.options.rootResolve!(this.xhr)
                return
            }
            if (this.xhr.status === 200 || this.xhr.status === 201) {
                let contentType = this.xhr.getResponseHeader('Content-Type')
                if (this.options.responseType === "blob") {
                    if (contentType === "blob") {
                        this.options.rootResolve!({BLOB_IS_RETURNED: true, BLOB_RESPONSE: this.xhr.response})
                    } else {
                        const blob = new Blob([this.xhr.response], {type: "text/plain"});
                        const reader = new FileReader();
                        reader.addEventListener('loadend', (e) => {
                            const text = (e.srcElement as any).result;
                            this.options.rootResolve!(JSON.parse(text))
                        });
                        reader.readAsText(blob);
                    }
                    return
                }
                if (this.options.resolveWithJson) {
                    let response = this.xhr.responseText
                    if (response) {
                        try {
                            this.options.rootResolve!(JSON.parse(this.xhr.responseText))
                        } catch (e) {
                            console.error(e)
                            if (XhrRequestMaker.onFailHandler) {
                                XhrRequestMaker.onFailHandler(this.xhr)
                            } else {
                                this.options.rootReject!(this.xhr)
                            }
                        }
                    } else {
                        this.options.rootResolve!({})
                    }
                } else {
                    this.options.rootResolve!(this.xhr)
                }
            } else {
                if (XhrRequestMaker.onFailHandler) {
                    XhrRequestMaker.onFailHandler(this.xhr)
                } else {
                    this.options.rootReject!(this.xhr)
                }
            }
        }
    }

    setHeaders() {
        if (this.options.requestHeaders) {
            for (let key of Object.keys(this.options.requestHeaders)) {
                let value = this.options.requestHeaders[key]
                this.xhr.setRequestHeader(key, value)
            }
        }
        if (!this.options.requestHeaders || !this.options.requestHeaders['Content-Type']) {
            this.xhr.setRequestHeader('Content-Type', 'application/json')
        }
    }

    objectToQueryString(objectToSerialize: { [id: string]: any }, prefix?: string): string {
        let strBuilder = []
        for (let property in objectToSerialize) {
            if (!objectToSerialize.hasOwnProperty(property)) {
                continue
            }
            let hashedKeyPath = prefix ? prefix + "[" + property + "]" : property
            let value = objectToSerialize[property];
            if (value !== null && typeof value === "object") {
                strBuilder.push(this.objectToQueryString(value, hashedKeyPath))
            } else {
                strBuilder.push(encodeURIComponent(hashedKeyPath) + "=" + encodeURIComponent(value))
            }
        }
        return strBuilder.join("&");
    }

    createFormData(object: any, form?: FormData, namespace?: string): FormData {
        const formData = form || new FormData();
        for (let property in object) {
            if (!object.hasOwnProperty(property) || !object[property]) {
                continue;
            }
            const formKey = namespace ? `${namespace}[${property}]` : property;
            if (object[property] instanceof Date) {
                formData.append(formKey, object[property].toISOString());
            } else if (typeof object[property] === 'object' && !(object[property] instanceof File)) {
                this.createFormData(object[property], formData, formKey);
            } else {
                formData.append(formKey, object[property]);
            }
        }
        return formData;
    }

}

