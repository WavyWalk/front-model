* [whats it](#What's-it)
* [why](#why)
* [basic example](#usage-example)
* [model modelData](#model-modelData)
* [relations](#relations)
* [deserialization](#deserializing)
* [serialization](#serializing-to-js-object)
* [API communication](#api-communication)
* [validations](#validations)
* [multipart](#form-serialization)
* [axios](#axios)

# What's it
Adds a model layer to your Typescript based front-end apps (best works with SPA's), providing:
* Works both in browser and node, can be used for ssr centric apps.
* Eases out communicating with your API backends
* Eases building complex SPAs, adding the missing model layer to your frontend
* De/serializing JSON to/from your models, mapping values to defined modelData. Serializes to multipart encoded form if needed.
* Supports relations.
* Provides validation.

# Why
The good ol' Models on the front-end is nowadays almost forgotten and unused, we're passing some weekly typed non consistent
objects back and forth, we're using some generic stores, in other words we make our frontend hell to maintain. 
Let's get to the roots!
Adding models to your React apps makes so many things easier. 
Combine them with some state management lib and you'll feel the difference.

#How 
npm i front-model 

# Usage example
Lib can be (should) used on both node and browser environments.

```typescript
import {ApiEndpoint, BaseModel, HasMany, HasOne, IRequestOptions, Property} from "front-model" 
import {MakeRequest} from "./ApiEndpoint"

class User extends BaseModel {
    
    @Property
    id?: number
   
    @Property
    name?: string

    @HasMany(()=>User)
    friends!: User[]
    
    @HasOne(()=>Account)
    account?: Account
    
    @ApiEndpoint("GET", {url: "api/users/:id"})
    static async show(options?: IRequestOptions, makeRequest?: MakeRequest): Promise<User> {
        const result = await makeRequest!()
        return User.deserialize(result.data)
    }
    
    @ApiEndpoint("POST", {url: "api/users"})
    async create(options?: IRequestOptions, makeRequest?: MakeRequest): Promise<User> {
        options!.data = this.serialize()
        const result = await makeRequest!()
        return User.deserialize(result.data)
    }
}

let friend = new User({name: "foo"})
let account = new Account({email: "joe@doe.com"})
let user = new User({name: "joe"})
user.account = account
user.friends.push(friend)

//requests with json body {name: "joe", account: {email: "joe@doe.com"}, friends: [{name: "foo"}]}
// server sends back {id: 1, name: "joe", account: {email: "joe@doe.com"}, friends: [{id: 2, name: "foo"}]}
let createdUser = await user.create()

createdUser.id // 1
createdUser.name //joe
createdUser.account.email //"joe@doe.com"
createdUser.friends //Array<User>[User{id: 2, name: "foo"}]

//                      ---------------
//example in component
const [user, setUser] = useState<User>()

const loadUser = async () => {
    const user = User.show({urlParams: {id: 1}}) // parses json response from server
    user.id // 1
    user.name // "joe"
    user.friends //User[]
    setUser(user)
} 

useEffect(() => {
    loadUser()
}, [])
```

# Model properties
each model has internal `modelData` object, where the model properties are stored.
to have typed getters setters from that object,
decorate required class properties that you want to map with `@Property`. 
`@Property` has an alias options.
When parsing, values under respective keys will be mapped to corresponding modelData on models.
e.g. 

```typescript
class User extends BaseModel {
    
    @Property
    name?: string
    
}

let user = new User({name: 'joe'})

internally represented as:

{
    modelData: 'joe'
}

user.name = "foo"

{
    modelData: 'foo'
}

modelData may have any key/values (due to nature of frontend unfortunately it's rarely possible to type everything, 
and you definetly will have some addional arbitrary value there ), 
so you can wrap any object at runtime with model and use it with all the feats oop will give you
```

`modelData` name was earlier called "properties" but that easily can clash with your backend models (you may have this name already)
same applies to just `data`, could call it _properties or _data but hate adding _ to publics, thought `modelData` is less "name clash prone".
and describes enough it's intent. 

# Relations

relations required for instantiating data during de/serialization.

`@HasMany`
expects a `Array<T>` of specified class.
if nothing's on property, when called will lazyly initialize to empty ModelCollection.
```typescript
class User {
    
    @HasMany(()=>Account)
    accounts!: []
}

let user = new User()

user.accounts // [], will always return an empty array if no value assigned

user.account.push(new Account)

user.accounts // [Account]
```


`@HasOne`
expects appropriate type.

as @Property it defines getter and setter which operates agains internal modelData object. 

Both relations decorators should be provided with a `() => T extends BaseModel` constructor of related class.
passing a function is required to avoid circular dependencies issues.

example:
```typescript
class User {
    
    @HasMany(()=>User)
    friends!: User[]    

    @HasOne(()=>User)    
    friend?: User    

}
```

When parsing appropriate constructors will be called, and your full graph will be validly de/serialized
to models, even if it's nested many levels down.

# Deserializing
just call your model's constructor with an object:
```typescript
let user = User({name: "joe", account: {email: "joe@doe"}, friends: [{name: "foo"}]})
user.name
user.friends // Array<User>[User{name: "foo"}]
user.account.email //"joe@doe"
user.account.someMethodOnAccount()
```
you can also provide aliases for modelData (incl. multiple) and related, and they will be respected by serializer.

alternatively you can use typed static `deserialize` method.

desrialization can be provided with options:
```typescript
{
    include?: string[], //will inlude in result modelData only specified here
    exclude?: string[], //will exclude from result prorties specified here 
    doBlock?: (value: any)=>any // will include value returned by func, will skip key if returns undefined
}

//e.g.

let data = {name: 'foo', email: 'bar', account: {id: '3', password: 5}}

User.deserialize(data, {
    exclude: ['email'],
    doBlock: {
        name: it=>`${it}Bar`
        account: it=>Acccount.deserialize(it, {only: ['id']})
    }
})

//with this options you have controll of what and how dota goes into final result.
// for nested relations doBlock shall be used. 
// if no relations mentioned in do block, related models be deserialized defaultly
User.deserialize({name: "joe", account: {id: 3}})
// {name: 'joe', account: Account}
```

p.s. doBlock named so because do is a keyword in js, but logic behind is "do value for key in this block"

# Serializing to js object
`user.serialize() //{name: "joe", account: {email: "joe@doe"}, friends: [{name: "foo"}]}`

serialize accepts same options as deserialize with same logic e.g.

# API communication

Use @ApiEndpoint decorators with appropriate modelData (take look at it's interface for details).

behind the scenes it will wrap your method implementation, with the request preaprator function and call your implementation 
passing the final optioins and request invoking function.

For xhr calls the axios is used, so you can pass any axios options, alongside you can pass the model specific options.

Both static and instance methods can be decorated.

Basically you provide ApiEndpoint an HTTP method, and configuration object with url (see `IRequestOptions` for implementation details).

If in url you provide url path token prefixed with ':', this token will be treated as named url parameter.

You can manually provide it when calling an 'ApiEndpoint' call, 
```typescript
@ApiEndpoint("POST", {url: "/api/user/:id/foo"}) 
async update(options?: IRequestOptions, makeRequest?: MakeRequest): Promise<User> {
    options.data = this.serialize()
    const res = await makeRequest()
    return User.deserialize(res.data)
}
// notice that makeRequest? arg it will be injected by decorator so you will always have it in request, you don't have to pass it.
// notice that options? arg - you can pass it to method call and it's values be used, but it will always be injected by decorator

user.id = 1
const updated = user.update({urlParams: {id: 1}}) //will query /api/user/1 with serialized user as datau

updated.name = 'foo'
updated.update({urlParams: {id: 1}, withCredentials: true}) // you can pass other options to request, look at IRequestOptions interface
```

# Validations
Lib gives you some convenient base to working with errors on client. It also handles errors returned from a server.

a lazy initialized .validator will return a Validator instance which has different methods to work with errors.

```typescript
class User extends BaseModel {
    @Property
    name?: string
}

const user = new User()
user.validator // Validator
user.validator.addError('name', 'too short')
user.valdator.addError('name', 'too foo')
user.errors // {name: ['too short', 'too foo']}
user.validator.isValid() // false

user.validator.addError('email', 'is blank')
user.validator.removeErrors('name')
user.validator.isValid() //false, errors {name: ['is blank']}
user.validator.resetErrors() // sets errors to undefined

//You can as well/should implement your Validator for each model

class UserValidator extends ModelValidator<User, ["default"]> { 
// as generic types to give you safety pass a model class, and additionnally optional array of possible validation groups
// to give you autocompletion
    
    name = () => {
        this.validatable // will be the model
        if (!this.validatable.name) {
            this.addError('name', 'isBlank')
        }   
    }
    
    email = (groups?: ['default']) => { // optional group that will be passed to method when you call e.g. validator.validate(['email'], ['default'])
        if (!this.validatable.email) {
            this.addError('email', 'isBlank')
        }
    }
    
}

class User {
    
    // override getter to get typed validator
    get validator() {
        return this._validator ??= new UserValidator(this)
    }
    
}
// valdate on validator accepts key in Validator implementation, and will 
// simply call same named methods
// so in example above yo defined name func and it be called here
user.validator.validate(['name'])

user.modelData // {errors: {name: ['isBlank'], email: ['isBlank']}}

user.errors // errors is simple get set to access under errors key in model.modelData
```

sample usage in component
```
const userForm = ({userId}) => {
    
    const [user, setUser] = useState<User>()

    const loadUser = async () => {
        setState(await User.find({urlParams: {userId}}))
    }

    const updateUser = async () => {
        user.validator.validate('name')
        if (!user.validator.isValid()) {
            alert(`errors: ${user.errors?.name?.join(',')}` )
            return
        }
        await user.save()
        //redirect
    }
       
    useEffect(()=>loadUser(), [])

    if (!user) {
        return <spinner/>
    }

    return <div>
        <input 
            value={user.name}   
            onChange={e=>user.name = e.target.value}
        />
        <button
            onClick={updateUser}
        >
            submit
        </button>
    </div>

}

```
The thing is that errors are also serialized if returned from server, so it makes it easy to handle them on client side.
say e.g.:
```typescript

const createdUser = user.create() // response from server {name: "joe", errors: {name: ["to many joes aboard"]}}
createdUser.validator.isValid() // false
createdUser.errors // {name: ["to many joes aboard"]}
setUser({user})

return <div>
   {!user.validator.isValid() &&
      <p>your name is invalid {user.validator.getFirstErrorFor('name')}</p>
   }
</div>
```
errors are serialized on serialize() if present, if you don't want that call resetErrors() before serialization to json.

structure for errors:
```typescript jsx
errors: {['nameOfProperty']: Array<String>/*array of error messages*/}
```

# Form serialization
Models and their collection can be serialized to valid encoded form, respecting hash format (ruby, php, net) of any nestability or collections etc..
So you just treat it uniformly and use one interface to work both with json and encoded form.

# axios
as said lib uses axios for request handling, 
axios instance with defualts can be set in `frontModelConfig`

this objects you can use as well for request interceptions etc.

# Dependences
axios.
For Typescript enable decoration processing.

# ps
many docs are missing will add when will have time.

# Licenses
MIT




