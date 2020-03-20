import { RequestOptions } from '../decorators/ApiEndpoint';
export declare class XhrRequestMaker {
    static userDefinedRequestOptionsHandler: (options: RequestOptions) => void;
    static withCredentials: boolean;
    static onFailHandler: (xhr: XMLHttpRequest) => void;
    static executeOnRequestStart?: (xhr?: XMLHttpRequest) => void;
    static executeOnRequestEnd?: (xhr?: XMLHttpRequest) => void;
    static get(options: RequestOptions): Promise<any>;
    static post(options: RequestOptions): Promise<any>;
    static put<T>(options: RequestOptions): Promise<any>;
    static delete<T>(options: RequestOptions): Promise<any>;
    static create(options: RequestOptions): Promise<any>;
    rootPromise: Promise<any>;
    xhr: XMLHttpRequest;
    options: RequestOptions;
    constructor(options: RequestOptions);
    send(): void;
    setParameters(): void;
    setOnLoad(): void;
    handleFail: () => void;
    setHeaders(): void;
    objectToQueryString(objectToSerialize: {
        [id: string]: any;
    }, prefix?: string): string;
    createFormData(object: any, form?: FormData, namespace?: string): FormData;
}
//# sourceMappingURL=XhrRequestMaker.d.ts.map