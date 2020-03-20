import { ModelCollection } from './ModelCollection';
import { BaseModel } from './BaseModel';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IAssociationsConfig } from './interfaces/IAssociationsConfig';
import { IModelProperties } from './interfaces/IModelProperties';
export declare class ModelSerializer {
    static parseCollection<T extends BaseModel>(modelConstructor: IModelConstructor, propertiesArray: Array<IModelProperties>): ModelCollection<T>;
    static parseFromConstructor(properties: IModelProperties, associationsConfig: IAssociationsConfig): IModelProperties;
    private static parseAssociatedFromConstructor;
    private static parseSingleBaseModel;
    private static parseCollectionOfBaseModel;
}
//# sourceMappingURL=ModelSerializer.d.ts.map