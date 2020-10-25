import {User} from "./testmodels/User"
import  {should, expect, assert} from "chai"
import {Account} from "./testmodels/Account"
import {frontModelConfig} from '../../../../src'
import axios from 'axios'

export const tests = () => {

    it('gets instantiated with default modelData', function () {
        const user = new User()
        assert.isNotNull(user)
        expect(user.modelData).to.eql({})
    })

    it('key - values passed to constructor land in modelData', function () {
        const testObject = {foo: 'bar', baz: [1], cux: {a: {b: 'c'}}}
        const user = new User(testObject)
        expect(user.modelData).to.eql({...testObject})
    })

    it('@Property creates a getter and setter', () => {
        let user = new User({name: 'joe'})
        expect(user.name).to.eql('joe')
        user.name = 'doe'
        expect(user.name).to.eql('doe')
        expect(user.modelData).to.eql({name: 'doe'})
    })

    it('@HasOne behaves correct', () => {
        const account = new Account()
        let user = new User({account: account})

        expect(user.account).equal(account)

        user.account = undefined

        expect(user.account).to.equal(undefined)

        user.account = new Account()

        expect(user.account).to.instanceOf(Account)

    })

    it('@HasOne serializes correctly', () => {
        const accountProperties = {email: "foo"}

        let user = new User({name: "joe", account: accountProperties})

        expect(user.modelData.account).to.instanceOf(Account)

        expect(user.modelData.account).to.equal(user.account, 'same instance')

        const account = user.account!

        expect(account.email).equal('foo')

        user = new User({account: {user: {name: 'nested'}}})

        expect(user.account!.user).to.instanceOf(User)

        expect(user.account!.user!.name).to.equal('nested')

    })

    it ('relations configs not overwrite each other (no shared relations metadata)', () => {
        const user = new User({same: {foo: "bar"}})
        const account = new Account({same: {foo: "bar"}})

        expect(user.same).not.instanceOf(User)

        expect(account.same).not.instanceOf(Account)
    })

    it ('@HasMany behaves correctly', () => {
        const firstAccData = {email: "joe"}
        const secAccData = {email: "foo"}

        let user = new User()

        expect(user.modelData.accounts).eql(undefined)

        expect(user.accounts).eql([], 'getter defaults to array')

        expect(user.modelData.accounts).eql([], 'after getter access default appears on modelData')

        user = new User({accounts: [firstAccData, secAccData]})

        expect(user.accounts.length).equal(2)

        expect(user.modelData.accounts[1]).instanceOf(Account)

        const acc = new Account({email: 'foo'})
        user = new User({accounts: [{email: "joe"}, acc]})

        expect(user.accounts[0]).instanceOf(Account)

        expect(user.accounts[1]).equals(acc)

        expect(acc.email).equals('foo')

        expect(user.accounts[1].modelData.email).equals('foo')

    })

    it('deserialization', () => {
        let data = {name: "joe", account: {email: 'foo'}}
        let user = new User(data)

        expect(user.name).eql('joe')
        expect(user.account).instanceOf(Account)
        expect(user.account?.email).equals('foo')

        user = User.deserialize({accounts: [{email: 'joe'}, {email: 'doe'}]})

        expect(user.accounts[0]).instanceOf(Account)

        expect(user.accounts[1].email).equal('doe')

    })

    it('deserialization with options', () => {
        let data = {name: "joe", account: {email: 'foo'}}
        let user = User.deserialize(data, {exclude: ['account']})

        expect(user.account).equals(undefined)

        user = User.deserialize(data, {
            doBlock: {
                name: it=>`${it}_lol`,
                account: it=>undefined
            }
        })

        expect(user.name).equals('joe_lol')

        expect('account' in user.modelData).equals(false, 'do block ret undefined not assigns key')

        user = User.deserialize(data, {
            doBlock: {
                name: it=>`${it}_lol`,
                account: it=>Account.deserialize(it, {doBlock: {email: it=>`${it}@bar`}})
            }
        })

        expect(user.account?.email).equal('foo@bar')


        user = User.deserialize(data, {
            include: ['name'],
            doBlock: {
                ['baz' as any]: (it: any) => 'fap'
            }
        })

        expect(user.account).equal(undefined, 'include excludes other keys')

        expect((user as any).modelData['baz']).equal('fap', 'return doBlock adds keys not in data to modelData')

    })

    it('serialization', () => {

        let user = new User({name: "joe", account: {email: 'foo'}})

        let serialized = user.serialize()

        expect(user.account).instanceOf(Account)

        expect(serialized).eql({name: 'joe', account: {email: 'foo'}})

        let acc = new Account({email: 'foo'})
        user = new User({account: acc})

        expect(user.serialize()).eql({account: {email: 'foo'}})

        user = new User({accounts: [{email: 'a'}, acc]})

        expect(user.serialize()).eql({accounts: [{email: 'a'}, {email: 'foo'}]}, 'has many serialize')

        user = new User({
            bestFriend: {name: 'hans'},
            accounts: [
                new Account({email: 'a'}), new Account({'email': 'b'})
            ]
        })

        expect(user.serialize()).eql({
            bestFriend: {name: 'hans'},
            accounts: [
                {email: 'a'}, {email: 'b'}
            ]
        })

    })


    it('request making', async () => {
        let result = await User.showNoSerialize()
        expect(result).eql({name: 'joe', account: {email: 'doe'}}, 'makes request to url')

        result = await User.showSerialize()
        expect(result).instanceOf(User)
        expect(result.account.email).equal('doe', 'serializes response')

        let user = new User({
            name: "joe",
            account: {email: 'doe'},
            accounts: [{email: 'bar'}]
        })

        result = await user.testPost()

        expect(result).instanceOf(User)
        expect(result).not.equal(user)

        expect(result.name).eql('joe')
        expect(result.account).instanceOf(Account)
        expect(result.accounts[0]).instanceOf(Account)

        result = await User.absoluteUrl({data: {name: 'joe'}})
        expect(result.name).equal('joe', 'abosolute url')

    })

    it('request making, options', async () => {

        let user = new User({name: "baz"})

        it('throwss on no param', async (done: any) => {
            try {
                await user.testAllParametrized()
            } catch (e) {
                done()
            }
        })

        let finalUrl: any = null
        user.testAllParametrized({
            urlParams: {rootPath: 'user', userId: '1'},
            transformFinalUrl: (url: string)=>{
                finalUrl = url
                return url
            }
        })

        expect(finalUrl).to.equal('/api/user/1')

        let result = await user.testAllParametrized({urlParams: {rootPath: 'user', userId: '1'}})
        expect(result).instanceOf(User)
        expect(result.name).equal('joe')

        user = new User({'name': 'joe'})
        result = await user.echo()

        expect(result.name).equal('joe')

        result = await user.echo({toMergeWithData: {'foo': 'bar'}})
        expect(result.modelData.foo).equal('bar', 'toMergeWithData merges')

        result = await user.echo({toMergeWithData: {'name': 'doe'}})
        expect(result.modelData.name).equal('doe', 'toMergeWithData overwrites merged key')

    })

    it('request options headers and cookies', async () => {

        let res = await User.headers({headers: {'x-content-foo': 'bar'}})

        expect(res['x-content-foo']).equal('bar')

        res = await User.setCookie({params: {name: 'foo', value: 'bar'}})

        res = await User.getCookies()

        expect(res.foo).equal('bar', 'cookie being set')

        frontModelConfig.axiosInstance = axios.create({
            baseURL: 'http://localhost:3001',
            withCredentials: false
        }) as any
        res = await User.setCookie({params: {name: 'foo', value: 'bar'}})
        res = await User.getCookies()
        expect(res.foo).not.equal('bar')

        frontModelConfig.axiosInstance = axios.create({
            baseURL: 'http://localhost:3001',
            withCredentials: true
        }) as any
        res = await User.setCookie({params: {name: 'foo', value: 'bar2'}})
        res = await User.getCookies()
        expect(res.foo).equal('bar2')
        frontModelConfig.setDefaultAxiosInstance()
    })


    it('axios request making', async ()=>{
        let user = new User({name: 'doe'})
        frontModelConfig.axiosInstance = axios.create({
            baseURL: 'http://localhost:3001',
            withCredentials: true,
        }) as any
        let result = await user.echo()
        expect(result.name).equal('doe', 'request base url, with credentials handling')
        frontModelConfig.setDefaultAxiosInstance()
    })

    it('validation', () => {
        let user = new User()
        user.validator.validate(['name'])
        user.validator.isValid()
        expect(user.validator.isValid()).equal(false, 'validate validate method')
        expect(user.errors).eql({name: ['isblank']})

        user.validator.removeErrors('name')
        expect(user.errors).eql(undefined)
        expect(user.validator.isValid()).equal(true)

        user.accounts.push(new Account())
        user.accounts[0].validator.validate(["email"])
        expect(user.validator.isValid()).equal(false, 'validate on nested marks nested as invalid')

        user = new User({accounts: [{}]})
        user.validator.validate(['name'])
        user.accounts[0].validator.validate(['email'])

        expect(user.validator.isValid()).equal(false)
        expect(user.accounts[0].validator.isValid()).equal(false)

        expect(user.validator.getFirstErrorFor('name')).equal('isblank', 'getFirstErrorFor')
        expect(user.validator.getErrorsFor('name')).eql(['isblank'], 'getErrorsFor')

        user.validator.resetErrors()

        expect(user.validator.isValid()).equal(true)
        expect(user.accounts[0].validator.isValid()).equal(true)

    })

    it('model merging', ()=>{
        let to = new User({
            account: {},
            accounts: [{}, {}]
        })

        let toMergeWith = new User(
            {
                errors: {name: ['invalid']},
                account: new Account({errors: {email: ['invalid']}}),
                accounts: [{errors: {email: ['nested1']}}, {errors: {email: ['nseted2']}}]
            })

        to.replaceErrorsFrom(toMergeWith)

        expect(to.errors.name?.[0]).equal('invalid', 'top level error merged')
        expect(to.account?.errors?.email?.[0]).equal('invalid', 'nested has one merged')
        expect(to.accounts?.[0].errors?.email?.[0]).equal('nested1', 'nested has many merged')

    })

}