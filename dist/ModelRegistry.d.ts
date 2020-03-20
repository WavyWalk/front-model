import { IModelConstructor } from './interfaces/IModelConstructor';
export declare class ModelRegistry {
    static registeredModels: {
        [id: string]: IModelConstructor;
    };
    static register(stringifiedClassName: string, model: IModelConstructor): void;
    static get(key: string): IModelConstructor;
    static modelGetterFuntion(key: string): () => IModelConstructor;
}
//# sourceMappingURL=ModelRegistry.d.ts.map