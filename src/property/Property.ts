import { BaseModel } from '../BaseModel';

/**
 * summary:
 * assigns on prototype a get and set for decorated property that
 * will get set on the
 * @see BaseModel.modelData
 * instead
 */
export function Property(
    ...args: any
): void {

    let [target,
        propertyName,
        descriptor
    ]: [BaseModel, string, any] = args

    let getter = function() {
        //@ts-ignore
        return this.modelData[propertyName]
    }

    let setter = function(valueToassign: any) {
        //@ts-ignore
        this.modelData[propertyName] = valueToassign
    }

    return {
        get: getter,
        set: setter
    } as any

}