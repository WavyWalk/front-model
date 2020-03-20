import { BaseModel } from './BaseModel';
export declare class ModelCollection<T extends BaseModel> {
    array: Array<T>;
    constructor(...values: Array<T>);
    push(value: T): void;
    pop(value: T): void;
    forEach(lambda: (value: T) => any): void;
    map(callback: (it: T, index: number) => any): any[];
    isNotEmpty(): boolean;
    filterInPlace(lambda: (it: T) => boolean): void;
}
//# sourceMappingURL=ModelCollection.d.ts.map