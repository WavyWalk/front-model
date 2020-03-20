import { BaseModel } from "../BaseModel";
import { IModelProperties } from '../interfaces/IModelProperties';
export interface RequestOptions {
    url?: string;
    method?: string;
    caller?: BaseModel;
    wilds?: {
        [id: string]: string | number | any;
    };
    yieldRawResponse?: boolean;
    urlPrefix?: string;
    toMergeWithPayload?: IModelProperties;
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
    rejectOnError?: boolean;
    queryParams?: {
        [id: string]: any;
    };
    isLoadingToggle?: (value: boolean) => any;
}
interface ApiEndpointOptions {
    url: string;
    defaultWilds?: Array<string>;
}
export declare function ApiEndpoint(httpMethod: string, options: ApiEndpointOptions): (target: BaseModel | typeof BaseModel, propertyName: string) => void;
export {};
//# sourceMappingURL=ApiEndpoint.d.ts.map