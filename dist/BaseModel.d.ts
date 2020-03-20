import { IModelProperties } from './interfaces/IModelProperties';
import { ModelCollection } from './ModelCollection';
import { RequestOptions } from './decorators/ApiEndpoint';
import { IPagination } from "./utils/IPaginatedResponse";
declare class ModelClassMixinContainer {
    constructor(...args: Array<any>);
}
declare const BaseModel_base: {
    new (...args: any[]): {
        getStaticAssociationsConfig(): import("./interfaces/IAssociationsConfig").IAssociationsConfig;
        init(properties?: IModelProperties | undefined): void;
        properties: IModelProperties;
        parsePropertes(properties: IModelProperties): IModelProperties;
        mergeProperties(properties: IModelProperties): void;
        mergeWith(model: BaseModel): void;
    };
    associationsConfig: import("./interfaces/IAssociationsConfig").IAssociationsConfig | null;
    getAssociationsConfig(): import("./interfaces/IAssociationsConfig").IAssociationsConfig;
} & {
    new (...args: any[]): {
        properties: IModelProperties;
        errors?: import("./validation/interfaces/IErrorsContainer").IErrorsContainer | null | undefined;
        hasFile: Boolean;
        getErrorsFor(propertyName: string): string[] | undefined;
        getFirstErrorFor(propertyName: string): string | undefined;
        removeErrorsFor(propertyName: string): void;
        addErrorFor(propertyName: string, ...errorsToAdd: string[]): void;
        replaceErrorFor(propertyName: string, ...errorsToAdd: string[]): void;
        removeHasNestedErrorsFlag(): void;
        removeSpecificErrorFrom(propertyName: string, error: any): void;
        containsSpecificError(propertyName: string, errorText: string): boolean;
        validate(options?: {
            validateOnly?: string[] | undefined;
            exclude?: string[] | undefined;
        } | undefined): void;
        isValid(): boolean;
        resetErrors(): void;
        validateIfNotBlank(propertyName: "properties" | "errors" | "hasFile" | "getErrorsFor" | "getFirstErrorFor" | "removeErrorsFor" | "addErrorFor" | "replaceErrorFor" | "removeHasNestedErrorsFlag" | "removeSpecificErrorFrom" | "containsSpecificError" | "validate" | "isValid" | "resetErrors" | "validateIfNotBlank", errorMessage: string): void;
    };
} & typeof ModelClassMixinContainer;
export declare class BaseModel extends BaseModel_base {
    properties: IModelProperties;
    static reactKey: number;
    private reactKey;
    getReactKey: () => number;
    constructor(properties?: IModelProperties);
    static jsonRoot: null;
    getJsonRoot(): string;
    serialize(root?: boolean): IModelProperties;
    normalizeWhenSerializing(value: any, root?: boolean): any;
    static afterIndexRequest(options: RequestOptions): Promise<any>;
    static parsePaginated<T>(response: {
        result: any[];
        pagination: IPagination;
    }): {
        result: ModelCollection<BaseModel>;
        pagination: IPagination;
    };
    static afterShowRequest(options: RequestOptions): Promise<BaseModel>;
    static afterNewRequest(options: RequestOptions): Promise<BaseModel>;
    static afterEditRequest(options: RequestOptions): void;
    beforeUpdateRequest(options: RequestOptions): void;
    afterUpdateRequest(options: RequestOptions): Promise<any>;
    beforeCreateRequest(options: RequestOptions): void;
    afterCreateRequest(options: RequestOptions): Promise<any>;
    beforeDeleteRequest(options: RequestOptions): void;
    afterDeleteRequest(options: RequestOptions): void;
    beforeDestroyRequest(options: RequestOptions): void;
    afterDestroyRequest(options: RequestOptions): void;
}
export {};
//# sourceMappingURL=BaseModel.d.ts.map