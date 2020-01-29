import {IModelProperties} from "../interfaces/IModelProperties"
import {ModelCollection} from "../ModelCollection"
import {BaseModel} from "../BaseModel"
import {AnyConstructor} from "../utils/AnyConstructor"
import {IErrorsContainer} from "../validation/interfaces/IErrorsContainer";


export function MixinValidatableTrait<TBase extends AnyConstructor>(Base: TBase) {
    
    return class ValidatableTrait extends Base {

        properties!: IModelProperties
        errors?: IErrorsContainer | null
        hasFile: Boolean = false

        getErrorsFor(propertyName: string): Array<string> | undefined {
            if (this.errors) {
              return this.errors[propertyName]
            } else {
               return undefined
            }
        }

        getFirstErrorFor(propertyName: string) {
            return this.getErrorsFor(propertyName)?.[0]
        }

        removeErrorsFor(propertyName: string) {
            if (this.errors) {
                delete this.errors[propertyName]
            }
        }

        addErrorFor(propertyName: string, ...errorsToAdd: string[]) {
            if (this.errors) {
                let errors = this.errors[propertyName]
                if (errors) {
                    errors.push(...errorsToAdd)
                } else {
                   this.errors[propertyName] = errorsToAdd   
                }
            } else {
                this.errors = {}
                this.errors[propertyName] = errorsToAdd
            }
        }

        removeHasNestedErrorsFlag() {

        }

        removeSpecificErrorFrom(propertyName: string, error: any) {
            const errors = this.getErrorsFor(propertyName)
            if (!errors) {
                return
            }
            const index = errors.indexOf(error)
            if (index < 0) {
                return
            }
            errors.splice(index, 1)
        }

        containsSpecificError(propertyName: string, errorText: string): boolean {
          let errors = this.getErrorsFor(propertyName)
          if (errors) {
            for (let index = 0; index < errors.length; index++) {
              if (`${errorText}` === `${errors[index]}`) {
                return true
              }
            }
          }
          return false
        }
        
        validate(options?: {validateOnly?: string[], exclude?: string[]}){
            this.errors = undefined
            let propertiesToValidate = Object.keys(this.properties)
            if (options?.validateOnly) {
                propertiesToValidate = options.validateOnly as any
            } else if (options?.exclude) {
                propertiesToValidate = propertiesToValidate.filter((it)=>{return !options.exclude!.includes(it as any)})
            }
            for (let key of propertiesToValidate) {
                let value = this.properties[key]
                let validator = (this as any)[`${key}Validator`]
                if (validator) {
                    (this as any)[`${key}Validator`]()
                    continue
                }
                if (value instanceof ModelCollection) {
                    value.forEach((it)=>{
                        (it as ValidatableTrait).validate()
                        this.hasFile = it.hasFile
                    })
                    continue
                }
                if (value instanceof ValidatableTrait) {
                    value.validate()
                    this.hasFile = value.hasFile
                    if (!value.isValid()) {
                        this.addErrorFor("nestedErrors", key)
                    }
                    continue
                }
            }
            let errors = this.properties.errors
            if (errors) {
                Object.keys(errors).forEach((key)=>{
                    this.addErrorFor(key, errors[key]) 
                })
            }
            this.properties.errors = undefined
        }

        isValid(): boolean {
            if (this.errors) {
                return false
            } else {
                return true
            }
        }

        resetErrors(){
            this.errors = null
            this.hasFile = false
            for (let key of Object.keys(this.properties)) {
                let value = this.properties[key]
                if (value instanceof ModelCollection) {
                   value.forEach((it)=>{
                      it.resetErrors()
                   })
                } else if (value instanceof ValidatableTrait) {
                    value.resetErrors()
                }
            }
        }
    }
}