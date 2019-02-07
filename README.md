# What's it
Adds a model layer to your Typescript based front-end apps (best works with SPA's), providing:
* De/serializing JSON to/from your models, mapping values to defined properties. Serializes to multipart encoded form if needed.
* Eases out xhr communication with server
* Supports associations. Eases handling collections of models.
* Gives you a validation base.
# Why
The good ol' Models on the front-end is nowadays almost forgotten and unused, we're passing some weekly typed non consistent
objects back and forth, we're using some generic stores. Let's get to the roots!
Adding models to your React apps makes so many things easier. Combine them with some state management lib, or just use some self written event dispatcher, and you'll feel the difference.
#How 
npm i front-model 

or include in package.json
# Basic example
```typescript
import {BaseModel, Property, HasMany, HasOne, Route, ModelCollection, RequestOptions} from "front-model"
class User extends BaseModel {
        
    @Property
    id: number | null = null
   
    @Property
    name: string | null = null

    @HasMany("User")
    friends!: ModelCollection<User>
    
    @HasOne("Account")
    account: Account | null = null
    
    @Route("GET", {url: "api/users/:id", defaultWilds: ["id"]})
    static show!: (options?: RequestOptions) => Promise<User>
    
    @Route("POST", {url: "api/users"})
    create!: (options?: RequestOptions) => Promise<User>
}

let friend = new User({name: "foo"})
let account = new Account({email: "joe@doe.com"})
let user = User({name: "joe"})
user.account = account
user.friends.push(friend)

//requests with json body "user: {name: "joe", account: {email: "joe@doe.com"}, friends: [{name: "foo"}]}"
user.save().then(function(createdUser){ //parses request from your server {name: "joe", account: {email: "joe@doe.com"}, friends: [{name: "foo"}]}
    createdUser.id // 1
    createdUser.name //joe
    createdUser.account.email //"joe@doe.com"
    createdUser.friends //ModelCollection<User>[User{name: "foo"}]
    if (!createdUser.isValid()) {
        this.setState({user: createdUser}) //render errors in case server hints of errors
        return
    }
    //on success redirect to new user welcome page or notify some user manager service
})

//in UserShowComponent
componentDidMount() {
    User.show({wilds: {id: 1}}).then(function(user) { // parses json response from server
        user.id // 1
        user.name // "joe"
        user.friends //ModelCollection<User>
        this.setState({user})
    })
}
```
# Model registration
Due to heavy usage of metaprogramming stuff, in some unreproducible cases (which mostly depend on weather outside), I encountered
a circular dependencies bugs that were really hard to tackle.
I couldn't find anything better than introducing a ModelRegistry.
Basically you create some singleton with e.g. run method in which `ModelRegistry.registeredModels` will be assigned with object
referencing your model class. That method is supposed to be called on your app bootstrapping. But treat it philosophically,
you have a file where you can track all the models you have :).
example: 
```typescript
import { User } from './models/User'
import { Account } from './models/Account'
import { ModelRegistry } from 'front-model'
export class ModelRegistrator {
  //THIS UGLY HACK SOLVES SOME NASTY CIRCULAR DEPENDENCIES BUGS!
  static run(){
    ModelRegistry.registeredModels = {
        User,
        Account
    }
  }

}
//in init application, in first context after interpreter done it's job
export function initApplication() {
    ModelRegistrator.run() //call that dude
    render(
        <BrowserRouter>
            <Route path="/" component={ApplicationComponent}/>
        </BrowserRouter>,
        document.getElementById("app"))
}
```
# Model properties
Just decorate properties that you want to map with @Property. @Property has an alias options.
When parsing, values under respective keys will be mapped to corresponding properties on models. 

# Associations
`@HasMany`
expects a `ModelCollection` of specified class.
if nothing's on property, when called will lazyly initialize to empty ModelCollection.

`@HasOne`
expects appropriate type.

Both associations should be provided with a stringified name of a an associated class (see model registration for a reason behind). 

When parsing appropriate constructors will be called, and your full graph will be validly serialized
to models.

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
More preferred way - if you implement for example `static jsonRoot = "user"` on your model's class, than it'd serialize like {user: {name: "joe", account: {email: "joe@doe"}, friends: [{name: "foo"}]}}.
# Xhr

Treat your server as a db/pure api. Communicate with it in restfull manner.

Use @Route decorations with appropriate properties (take look at it's interface implementation for details).

You can decorate both static and instance methods.

Basically you provide Route an HTTP method, and configuration object with (minimum required) url.

If in url you provide something prefixed with ':', this token will be treated as named parameter.

You can either manually provide it when calling a 'route' call, or allow it to be treated automatically.
```typescript
@Route("POST", {url: "/api/user/:id/foo", defaultWilds: ["id"]}) //defaultWilds specifies that :id, should be replaced with value of id property.
create: (options?: RequestOptions) => Promise<User> //always specify a type without implementation, method it'self will be programmatically added and implemented

user.id = 1
user.create() //will query /api/user/1 with serialized payload
user.create({wilds: {id: 3}}) //will query /api/user/30 with serialized payload
```
When providing a route, two methods (or one of the implemented) will be called IF IMPLEMENTED (not required) - before, and respectively after your request:

before[capitalized name of the method]Request(options?: RequestOptions)

after\[capitalized name of the method]Request(options: RequestOptions)

You get your response in after method via options.response.

```typescript
@Route("GET", {url: '/api/user/funky/:id}')
saveFunkyUser: (options?: RequestOptions) => Promise<User>

beforeSaveFunkyUserRequest(options: RequestOptions) {
    options.params = this.getPureProperties()
    options.params["isFunky"] = true
    options.serializeAsForm = true
}

afterSaveFunkyUserRequest(options: RequestOptions) {
    options.deferredPromise.then((resp)=>{
          let funkyUser = new User(resp)
          funkyUser.validate()
          funkyUser.doSomeFunkyStuff()
          return funkyUser
    })
}
```
As seen those methods are used for modifying request being done, and manually handling the response of request's promise.

By default route's response will yield a parsed json (an object), if you want to handle it yourself, pass yieldRawResponse = true, in before handler.

Again if you do not implement those, they will just not be called.

By default, some before/after predefined handlers are automatically there for you (no need to implement).

If you just decorate, instance methods: `create, update, destroy`, static methods: `show, index`, 
following before/after handlers will be provided (you can override them if you want).

`create` - before: will serialize model to object and pass it to request body. after: will parse response to model and call `validate()` on it

`update` - same as create

`destroy` - same as create

`static` show - before-nothing, after serializes response to model

`static` index - before-nothing, after serializes response to model collection

basically:
```typescript
@Route("GET", {url: "api/user"})
static index!: (options?: RequestOptions) => Promise<ModelCollection<User>> //no need to define before/after handlers

@Route("POST", {url: "api/user/:id", defaultWilds: ["id"]})
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
Your associated models, and multiple models, should be used through that type.

usage:
```typescript
@HasMany("Account")
accounts: ModelCollection<Account> //lazyly initialized to empty ModelCollection<Account>() // []

//or

users = new ModelCollection<User>()
users.push(new User(), new User())
```

# Validations
Lib gives you some convenient base to working with errors on client. It also handles errors returned from a server.

If you have a @Property decorated property, and if you implement function \[property name]Validator() (if not implemented nothing happens),
this function will be called during validation (e.g. if you want to prevalidate on client before sending to server).
```typescript
@Property
name: String | null = null

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
user.specificCreate((user)=>{ // response from server {name: "joe", errors: {name: ["to many joes aboard"]}}
    user.validate()
    user.isValid() // false
    user.errors // {name: ["to many joes aboard"]}
    this.setState = {user}
    // in your component
    // if (this.state.user.hasErrorsFor(name)) {
    //      render e.g user.getErrorsFor("name") near input    
})

```
errors are serialized on getPureProperties() if present, if you don't want that call resetErrors() before serialization to json.

# Form serialization
That's a really good feature.
Models and their collection can be serialized to valid encoded form, respecting hash format of any nestability or collections etc..
In fact if you have a file property, and on validate that property you will set hasFile = true on model, when making request, e.g. create,
model will be serialized to form and that multipart request will be sent (ex.below)
So you just treat it uniformly and use one interface to work both with json and encoded form.
As extra you can pass nested or multiple files// theres a way for listening to upload status/process will doc later

this example uses some other my lib, but you'll get the idea how can models be used
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
    submit(){
        this.collectInputs() 
        let user = this.state.user
        user.avatar.file // File
        //will send an encoded form with hash format:
        //like user[name]
        //     user[avatar][file] etc
        user.create().then((newUser)=>{ // you can pass there an RequestOptions; {serializeAsForm: true}// this case its detected automatically if file present
            if (newUser.isValid()) { 
                CurrentUser.instance.logIn(newUser) // dispatches some events, redirects notifies other components
                return
            } 
            user.mergeWith(newUser) //will doc later, in this case to not lose a file from input
            this.setState({user}) // render an inputs with errors
        })
    }
}
```

# Dependences
es-6 promises.
For Typescript enable decoration processing.
Supposed to work only with Typescript.

# Licenses
MIT or FTPL





