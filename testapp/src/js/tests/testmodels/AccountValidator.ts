import {ModelValidator} from "../../../../../src"
import {Account} from "./Account"

export class AccountValidator extends ModelValidator<Account, ['default']> {

    email = () => {
        const email = this.validatable.email
        if (!email) {
            this.addError('email', 'isblank')
        }
    }

}