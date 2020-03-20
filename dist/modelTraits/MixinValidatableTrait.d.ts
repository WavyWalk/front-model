import { IModelProperties } from "../interfaces/IModelProperties";
import { AnyConstructor } from "../utils/AnyConstructor";
import { IErrorsContainer } from "../validation/interfaces/IErrorsContainer";
export declare function MixinValidatableTrait<TBase extends AnyConstructor>(Base: TBase): {
    new (...args: any[]): {
        properties: IModelProperties;
        errors?: IErrorsContainer | null | undefined;
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
} & TBase;
//# sourceMappingURL=MixinValidatableTrait.d.ts.map