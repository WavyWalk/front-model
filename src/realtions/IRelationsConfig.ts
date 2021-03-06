import { RelationTypesEnum } from '../RelationTypesEnum';
import { IModelConstructor } from '../interfaces/IModelConstructor';

export interface IRelationsConfig {
    [id: string]: IRelationsConfigEntry
}

export interface IRelationsConfigEntry {
    associationType: RelationTypesEnum,
    getThatModelConstructor: ()=>IModelConstructor,
    aliasedTo: string | null,
}