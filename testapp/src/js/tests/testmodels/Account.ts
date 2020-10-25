import {BaseModel, HasOne, Property} from "../../../../../src"
import {User} from "./User"
import {AccountValidator} from "./AccountValidator"

export class Account extends BaseModel {

    get validator() {
        return this._validator ??= new AccountValidator(this)
    }

    @Property
    email!: string

    @HasOne(()=>User)
    user?: User

    @HasOne(()=>User)
    same?: User

}