import { AssociationTypesEnum } from '../AssociationTypesEnum';
import { IModelConstructor } from './IModelConstructor';
export interface IAssociationsConfig {
    [id: string]: IAssociationsConfigEntry;
}
export interface IAssociationsConfigEntry {
    associationType: AssociationTypesEnum;
    getThatModelConstructor: () => IModelConstructor;
    aliasedTo: string | null;
}
//# sourceMappingURL=IAssociationsConfig.d.ts.map