import { BaseModel } from '../BaseModel';
export function Property(
    target: BaseModel,
    propertyName: string
) {
    let getter = function() {
        //@ts-ignore
        return this.properties[propertyName]
    }

    let setter = function(valueToassign: any) {
        //@ts-ignore
        this.properties[propertyName] = valueToassign
    }
    
    Object.defineProperty(
        target,
        propertyName,
        {
            get: getter,
            set: setter
        }
    )
}