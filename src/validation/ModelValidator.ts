import {BaseModel} from "../BaseModel"
import {allRelatedAreValid, resetmodelDataOnAllRelated} from "./validatorUtils"
import {IPlainObject} from "../utils/IPlainObject"


export class ModelValidator<MODEL_TYPE, SUPPORTED_VALIDATION_GROUPS> {

    validatable: MODEL_TYPE

    constructor(model: MODEL_TYPE) {
        this.validatable = model
    }

    /** method exists only as internal type util to not retype cast*/
    private getValidatableAsBaseModel() {
        return this.validatable as any as BaseModel
    }

    addError(property: keyof MODEL_TYPE, errorMessage: string) {
        const validatable = this.getValidatableAsBaseModel()
        validatable.modelData.errors ??= {}
        validatable.modelData.errors[property] ??= []
        validatable.modelData.errors[property].push(errorMessage)
    }

    removeErrors(property: keyof MODEL_TYPE) {
        const validatable = this.getValidatableAsBaseModel()
        const errors = validatable.modelData?.errors
        delete errors?.[property]
        if (errors && Object.keys(errors).length < 1) {
            delete validatable.modelData.errors
        }
    }

    removeSpecificError(property: keyof MODEL_TYPE, errorToDelete: string) {
        const validatable = this.getValidatableAsBaseModel()
        const propertyErrors = validatable.modelData.errors?.[property]
        const indexToDelete = propertyErrors?.indexOf?.(errorToDelete)
        if (indexToDelete < 0) {
            return
        }
        propertyErrors.splice(indexToDelete)
    }

    resetErrors() {
        const validatable = this.getValidatableAsBaseModel()
        validatable.modelData.errors = undefined
        const modelData = validatable.modelData
        if (!modelData) {
            return
        }
        resetmodelDataOnAllRelated(validatable, modelData)
    }

    validate(
        validationMethods: (keyof this)[],
        validationGroups?: SUPPORTED_VALIDATION_GROUPS
    ) {
        for (let validationMethod of validationMethods) {
            const validateFunc = this[validationMethod]
            if (!validateFunc) {
                throw new Error(`no ${validationMethod} validation func defined on validator ${this}`)
            }
            (validateFunc as any)(validationGroups)
        }

    }

    isValid() {
        const validatable = this.getValidatableAsBaseModel()
        const errors = validatable.modelData.errors
        let modelData = validatable.modelData ?? {}
        let hasErrors = errors && Object.keys(errors).length > 0
        if (hasErrors) {
            return false
        }
        return allRelatedAreValid(validatable, modelData)
    }

    getFirstErrorFor(property: string): undefined | string {
        return this.getErrorsFor(property)?.[0]
    }

    getErrorsFor(property: string): string[] | undefined {
        return this.getValidatableAsBaseModel().errors?.[property]
    }

    /**
     * for overriding, to run your default set of validations
     */
    validateDefault = () => {

    }

}