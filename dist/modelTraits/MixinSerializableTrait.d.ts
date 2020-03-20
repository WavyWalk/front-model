import { BaseModel } from '../BaseModel';
import { IAssociationsConfig } from "../interfaces/IAssociationsConfig";
import { IModelProperties } from "../interfaces/IModelProperties";
import { AnyConstructor } from "../utils/AnyConstructor";
export declare function MixinSerializableTrait<TBase extends AnyConstructor>(Base: TBase): {
    new (...args: any[]): {
        getStaticAssociationsConfig(): IAssociationsConfig;
        init(properties?: IModelProperties | undefined): void;
        properties: IModelProperties;
        parsePropertes(properties: IModelProperties): IModelProperties;
        mergeProperties(properties: IModelProperties): void;
        mergeWith(model: BaseModel): void;
    };
    associationsConfig: IAssociationsConfig | null;
    getAssociationsConfig(): IAssociationsConfig;
} & TBase;
//# sourceMappingURL=MixinSerializableTrait.d.ts.map