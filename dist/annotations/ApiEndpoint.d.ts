import { BaseModel } from "../BaseModel";
import { IModelProperties } from '../interfaces/IModelProperties';
export interface RequestOptions {
    url?: string;
    method?: string;
    caller?: BaseModel;
    wilds?: {
        [id: string]: string;
    };
    yieldRawResponse?: boolean;
    urlPrefix?: string;
    mergeToPayload?: IModelProperties;
    serializeAsForm?: boolean;
    arbitrary?: any;
    payload?: IModelProperties;
    responseType?: string;
    prefix?: string;
    requestHeaders?: {
        [id: string]: any;
    } | null;
    httpMethod?: string;
    resolveWithJson?: boolean;
    rootPromise?: Promise<any>;
    rootResolve?: (...args: any[]) => any;
    rootReject?: ((...args: any[]) => any);
}
interface ApiEndpointOptions {
    url: string;
    defaultWilds?: Array<string>;
    beforeHandler?: (options: RequestOptions) => any;
    afterHandler?: (options: RequestOptions) => Promise<any>;
}
export declare function ApiEndpoint(httpMethod: string, options: ApiEndpointOptions): (target: BaseModel | typeof BaseModel, propertyName: string) => void;
export {};
//# sourceMappingURL=ApiEndpoint.d.ts.map