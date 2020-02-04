export class ObjectToQueryStringSerializer {
    static serialize(objectToSerialize?: {[id:string]: any}) {
        if (!objectToSerialize) {
            return null
        }
        return this.serializeLevel(objectToSerialize)
    }

    private static serializeLevel(objectToSerialize: {[id:string]: any}, pathAccumulator: string|null = null): string {
        let result = []
        for (let property in objectToSerialize) {
            if (objectToSerialize.hasOwnProperty(property)) {
                let propertyPath =  pathAccumulator ? `${pathAccumulator}[${property}]` : property
                let value = objectToSerialize[property];
                result.push((value !== null && typeof value === "object")
                    ? this.serializeLevel(value, propertyPath)
                    : encodeURIComponent(propertyPath) + "=" + encodeURIComponent(value));
            }
        }
        return result.join("&");
    }
}

