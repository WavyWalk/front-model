import {ApiEndpoint, BaseModel, HasMany, HasOne, IRequestOptions, Property} from "../../../../../src"
import {Account} from "./Account"
import {MakeRequest} from "../../../../../src"
import {UserValidator} from "./UserValidator"

export class User extends BaseModel {

    get validator() {
        return this._validator ??= new UserValidator(this)
    }

    @Property
    name?: string

    @HasOne(()=>Account)
    account?: Account

    @HasOne(()=>Account)
    same?: User

    @HasMany(()=>Account)
    accounts!: Account[]

    @HasOne(()=>User)
    bestFriend?: User

    @ApiEndpoint("get", {url: '/api/user/1'})
    static async showNoSerialize(options?: IRequestOptions, makeRequest?: MakeRequest) {
        let result = await makeRequest!()
        return result.data
    }

    @ApiEndpoint("get", {url: '/api/user/1'})
    static async showSerialize(options?: IRequestOptions, makeRequest?: MakeRequest) {
        let result = await makeRequest!()
        return User.deserialize(result.data)
    }

    @ApiEndpoint('post', {url: '/api/echo'})
    async testPost(options?: IRequestOptions, makeRequest?: MakeRequest) {
        options!.data = this.serialize()
        const res = await makeRequest!()
        return User.deserialize(res.data)
    }

    @ApiEndpoint('get', {url: '/api/:rootPath/:userId'})
    async testAllParametrized(options?: IRequestOptions, makeRequest?: MakeRequest) {
        options!.data = this.serialize()
        const res = await makeRequest!()
        return User.deserialize(res.data)
    }

    @ApiEndpoint('post', {url: '/api/echo'})
    async echo(options?: IRequestOptions, makeRequest?: MakeRequest) {
        options!.data = this.serialize()
        const res = await makeRequest!()
        return User.deserialize(res.data)
    }

    @ApiEndpoint('get', {url: '/api/requestHeaders'})
    static async headers(options?: IRequestOptions, makeRequest?: MakeRequest) {
        const res = await makeRequest!()
        return res.data
    }

    @ApiEndpoint('get', {url: '/api/cookiePut'})
    static async setCookie(options?: IRequestOptions, makeRequest?: MakeRequest) {
        return await makeRequest!()
    }

    @ApiEndpoint('get', {url: '/api/cookies'})
    static async getCookies(optoins?: IRequestOptions, makeRequest?: MakeRequest) {
        const res = await makeRequest!()
        return res.data
    }

    @ApiEndpoint('post', {url: 'http://localhost:3000/api/echo'})
    static async absoluteUrl(options?: IRequestOptions, makeRequest?: MakeRequest) {
        const res = await makeRequest!()
        return User.deserialize(res.data)
    }

}