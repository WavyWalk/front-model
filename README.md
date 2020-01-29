# What's it
Adds a model layer to your Typescript based front-end apps (best works with SPA's), providing:
* Eases out communicating with your API backends
* Eases building complex SPAs, adding the missing M to your views
* De/serializing JSON to/from your models, mapping values to defined properties. Serializes to multipart encoded form if needed.
* Supports associations. Eases handling collections of models.
* Provides validation base.
# Why
The good ol' Models on the front-end is nowadays almost forgotten and unused, we're passing some weekly typed non consistent
objects back and forth, we're using some generic stores. Let's get to the roots!
Adding models to your React apps makes so many things easier. Combine them with some state management lib, or just use some self written event dispatcher, and you'll feel the difference.
#How 
npm i front-model 

or include in package.json
# Basic example
```typescript
import {BaseModel, Property, HasMany, HasOne, ApiEndpoint, ModelCollection, RequestOptions} from "front-model"
class User extends BaseModel {
    
    @Property
    id?: number
   
    @Property
    name?: string

    @HasMany("User")
    friends!: ModelCollection<User>
    
    @HasOne("Account")
    account?: Account
    
    @ApiEndpoint("GET", {url: "api/users/:id", defaultWilds: ["id"]})
    static show!: (options?: RequestOptions) => Promise<User>
    
    @ApiEndpoint("POST", {url: "api/users"})
    create!: (options?: RequestOptions) => Promise<User>
}

let friend = new User({name: "foo"})
let account = new Account({email: "joe@doe.com"})
let user = new User({name: "joe"})
user.account = account
user.friends.push(friend)

//requests with json body "user: {name: "joe", account: {email: "joe@doe.com"}, friends: [{name: "foo"}]}"
// server sends back {id: 3, name: "joe", account: {email: "joe@doe.com"}, friends: [{id: 2, name: "foo"}]}
let createdUser = await user.save()

createdUser.id // 1
createdUser.name //joe
createdUser.account.email //"joe@doe.com"
createdUser.friends //ModelCollection<User>[User{name: "foo"}]
if (!createdUser.isValid()) {
    setUsers({user: createdUser}) //render errors in case server hints of errors
    return
}
//on success redirect to new user welcome page or notify some user manager service

//                      ---------------
//in User component
useEffect() {
    const user =User.show({wilds: {id: 1}}) // parses json response from server
    user.id // 1
    user.name // "joe"
    user.friends //ModelCollection<User>
    setUser(user)
}
```
# Model registration
Because of associations support between models, in cases where models reference each other, you may encounter circular dependencies issues.
To exclude and prevent those problems, the model have to be registered in the registry provided by the lib.
```typescript
import { User } from './models/User'
import { Account } from './models/Account'
import { ModelRegistry } from 'front-model'
export class ModelRegistrator {

  static run(){
    ModelRegistry.registeredModels = {
        User,
        Account
    }
  }

}
//in init application, in first context after interpreter done it's job and before you use models.
export function initApplication() {
    ModelRegistrator.run() //call that dude
    ReactDOM.render(
        <App/>,
        document.getElementById("app"))
}
```
# Model properties
Just decorate properties that you want to map with `@Property`. `@Property` has an alias options.
When parsing, values under respective keys will be mapped to corresponding properties on models. 

# Associations
`@HasMany`
expects a `ModelCollection` of specified class.
if nothing's on property, when called will lazyly initialize to empty ModelCollection.

`@HasOne`
expects appropriate type.

Both associations should be provided with a stringified name of a an associated class (see model registration for a reason behind). 

When parsing appropriate constructors will be called, and your full graph will be validly serialized
to models, even if it's nested many levels down.

# Parsing
just call your model's constructor with an object:
```typescript
let user = User({name: "joe", account: {email: "joe@doe"}, friends: [{name: "foo"}]})
user.name
user.friends // ModelCollection<User>[User{name: "foo"}]
user.account.email //"joe@doe"
```
you can also provide aliases for properties (incl. multiple) and associated, and they will be respected by serializer.

# Serializing to js object
`user.getPureProperties() //{name: "joe", account: {email: "joe@doe"}, friends: [{name: "foo"}]}`
To include the root name in json, define `static jsonRoot = "${rootKeyName}"` on your model's class, than it'd serialize like `{\`${rootKeyName}\`: {name: "joe", account: {email: "joe@doe"}, friends: [{name: "foo"}]}}`.
# API communication

Treat your server as a db/pure api. Communicate with it in restfull manner.

Use @ApiEndpoint decorators with appropriate properties (take look at it's interface for details).

Both static and instance methods can be decorated.

Basically you provide ApiEndpoint an HTTP method, and configuration object with url see `RequestOptions` for implementation details.

If in url you provide url path token prefixed with ':', this token will be treated as named parameter.

You can either manually provide it when calling a 'route' call, or allow it to be populated automatically.
```typescript
@ApiEndpoint("POST", {url: "/api/user/:id/foo", defaultWilds: ["id"]}) //defaultWilds specifies that :id, should be replaced with value of id property on model instance.
create: (options?: RequestOptions) => Promise<User> //always specify a type without implementation, method it'self will be programmatically added and implemented

user.id = 1
user.create() //will query /api/user/1 with serialized payload
user.create({wilds: {id: 3}}) //will query /api/user/30 with serialized payload
```
When providing a route, two methods (or one of the implemented) will be called IF IMPLEMENTED (not required) - before, and respectively after your request:

`before${capitalizedMethodNameOfYourRequestMethod}Request(options?: RequestOptions)`

after\[capitalized name of the method]Request(options: RequestOptions)

You get your response in after method via options.response.

example:
```typescript
@ApiEndpoint("GET", {url: '/api/user/funky/:id}')
saveFunkyUser: (options?: RequestOptions) => Promise<User>

beforeSaveFunkyUserRequest(options: RequestOptions) {
    // !!! the params !!! on options object is the request payload, whatever you put there will be treated as such.
    options.params = this.getPureProperties()
    options.params["isFunky"] = true
    options.serializeAsForm = true
    // do ANY thing that only allowed on xhr object
}

afterSaveFunkyUserRequest(options: RequestOptions) {
    let response = await options.rootPromise    
    let funkyUser = new User(response)
    funkyUser.validate()
    funkyUser.doSomeFunkyStuff()
    return funkyUser
}
```
As seen those methods are used for modifying request being done, and manually handling the response of request's promise.

By default route's response will yield a parsed json (an object), if you want to handle it yourself, pass yieldRawResponse = true.

so promise will resolve with an standart xhr object so you can do whatever you want with it.

Again if you do not implement those, they will just not be called.

By default, some before/after predefined handlers are automatically there for you (no need to implement).

If you just decorate, instance methods: `create, update, destroy`, static methods: `show, index`, 
following before/after handlers will be provided (you can override them if you want).

`create` - before: will serialize model to object and pass it to request body e.g. as `options.params = model.getPureProperties()`. after: will parse response to model and call `validate()` on it

`update` - same as create

`destroy` - same as create

`static` show - before-nothing, after serializes response to model

`static` index - before-nothing, after serializes response to model collection

basically:
```typescript
@ApiEndpoint("GET", {url: "api/user"})
static index!: (options?: RequestOptions) => Promise<ModelCollection<User>> //no need to define before/after handlers

@ApiEndpoint("POST", {url: "api/user/:id", defaultWilds: ["id"]})
create!: (options?: RequestOptions) => Promise<User> //no need also as the name itself hints of it


User.index().then((users)=>{
    users.forEach((user)=>{
        user.id
    })
})

let user = new User()
user.name = "joe"
user.create().then((createdUser)=>{ // no need to manually handle request body / de/serialization before/after request is done automatically
    if (!user.isValid()) {
        throw new DafuqException()
    }
    user.id
})

```

# collections
There is a ModelCollection<T> (look at it's implementation for details), which is just a simple array wrapper with some useful methods. 
Your associated models, and multiple models, should be used through that type. to access underlying array just use `modelCollection.array`

usage:
```typescript
// in model class body
@HasMany("Account")
accounts: ModelCollection<Account> //lazyly initialized to empty ModelCollection<Account>() // []
// later in code
users = new ModelCollection<User>()
users.push(new User(), new User())
//or
users.array.push(new User())

user.friends = users
```

# Validations
Lib gives you some convenient base to working with errors on client. It also handles errors returned from a server.

If you have a `@Property` decorated property, and if you implement function \[property name]Validator() (if not implemented nothing happens),
this function will be called during validation (e.g. if you want to prevalidate on client before sending to server).
```typescript
@Property
name?: String

nameValidator() {
    if (notFunky(name)) {
        this.addErrorFor("name", "not funky enough!")
    }
}

let user = new User({name: "joe"})
user.validate()
if (!user.isValid()) {
    user.errors // {name: ["not funky enough!"]}
    user.getErrorsFor("name") // ["not funky enough!"]
    user.resetErrors()
    user.isValid() // true
}

```
The thing is that errors are also serialized if returned from server, so it makes it easy to handle them on client side.
say e.g.:
```typescript

const createdUser = user.create() // response from server {name: "joe", errors: {name: ["to many joes aboard"]}}
createdUser.isValid() // false
createdUser.isValid() // false
createdUser.errors // {name: ["to many joes aboard"]}
setUser({user})

return <div>
   {!user.isValid() &&
      <p>your name is invalid {user.getFirstErrorFor('name')}</p>
   }
</div>
```
errors are serialized on getPureProperties() if present, if you don't want that call resetErrors() before serialization to json.

# Form serialization
That's a really good feature.
Models and their collection can be serialized to valid encoded form, respecting hash format of any nestability or collections etc..
In fact if you have a file property, and on validate that property you will set hasFile = true on model, when making request, e.g. create,
model will be serialized to form and that multipart request will be sent (ex.below)
So you just treat it uniformly and use one interface to work both with json and encoded form.
As extra you can pass nested or multiple files// theres a way for listening to upload status/process will doc later

this example uses some other my lib *(uses old class component/will update it later), but you'll get the idea how can models be used
```typescript
export class Create extends MixinFormableTrait(BaseReactComponent) { // from other lib

    state: {user: User} = {
      user: new User({account: {}, avatar: {}})
    }

    render(){
        return <div>
            <PlainInputElement model={this.state.user} propertyName="name" registerInput={this.registerInput}/> //those also render errors if present
            <PlainInputElement model={this.state.user.account} propertyName="password" registerInput={this.registerInput}/>
            <PlainInputElement model={this.state.user.account} propertyName="passwordConfirmation" registerInput={this.registerInput}/>
            <PlainFileInput model={this.state.user.avatar} propertyName="file" registerInput={this.registerInput}/>
            <button onClick={this.submit}>
                submit
            </button>
        </div>
    }

    @autobind
    async submit(){
        this.collectInputs() 
        let user = this.state.user
        user.avatar.file // File
        //will send an encoded form with hash format:
        //like user[name]
        //     user[avatar][file] etc
        const newUser = await user.create({serializeAsForm: true}) // you can pass there an RequestOptions; {serializeAsForm: true}// this case its detected automatically if file present
        if (newUser.isValid()) { 
            CurrentUser.instance.logIn(newUser) // dispatches some events, redirects notifies other components
            return
        } 
        user.mergeWith(newUser) //will doc later, in this case to not lose a file from input
        this.setState({user}) // render an inputs with errors
    }
}
```
# Request interception / failed request handling.
you can define `XhrRequestMaker.onFailHandler` which will be called on xhr error.
e.g. 
```typescript jsx
// this be called on every xhr exception, for specific cases you may always resort to {yieldRawResponse: true} 
XhrRequestMaker.onFailHandler =  (xhr: XMLHttpRequest) => {
    const statusCode = xhr.status
    if (UNAUTHORIZED_STATUS_CODES.includes(statusCode)) {
        RouterNavigationUtils.pushToLogin()
    }
}
// if no handler specified you can youse the await catch to handle an error.
```

# Dependences
no dependencies.
For Typescript enable decoration processing.
Supposed to work only with Typescript.

# Licenses
MIT





