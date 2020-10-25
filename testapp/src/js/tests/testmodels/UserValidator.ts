import {ModelValidator} from "../../../../../src"
import {User} from "./User"

export class UserValidator extends ModelValidator<User, any>{

    name = () => {
        const name = this.validatable.name
        if (!name) {
            this.addError('name', 'isblank')
        }
    }

}