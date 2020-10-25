export class ToFormDataSerializer {

    serialize(object: any, form?: FormData, namespace?: string): FormData {
        if (!FormData) {
            return null as any
        }
        const formData = form || new FormData();
        for (let property of Object.keys(object)) {
            const formKey = namespace ? `${namespace}[${property}]` : property;
            if (object[property] instanceof Date) {
                formData.append(formKey, object[property].toISOString());
            } else if (typeof object[property] === 'object' && !(object[property] instanceof File)) {
                this.serialize(object[property], formData, formKey);
            } else {
                formData.append(formKey, object[property]);
            }
        }
        return formData;
    }

}

export const toFormDataSerializer = new ToFormDataSerializer()