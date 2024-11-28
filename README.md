# pwix:accounts-zimbra

## What is it ?

A login service for the Zimbra LDAP directory.

On client side, this package defines `Meteor.loginWithZimbra()` function.

## How does that work ?

Zimbra is an open-source mail manager which stores and manages its accounts inside of a LDAP directory.

Taking advantage of this LDAP directory to check an identity and its password is rather straightforward, though it has unfortunately the drawback of not embedding authorizations for a given application.

This is so a configuration option to automatically create any authenticated account into the local account database of the application.

## Provides

`pwix:accounts-zimbra` exports a global `AccountsZimbra` object.

### Functions

#### `AccountsZimbra.configure( o<Object> )`

See [below](#configuration)

#### `AccountsZimbra.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

#### `Meteor.loginWithIzIAM( options<Object>, ( err ) => {})`

An async function which starts the login OpenID flow. It doesn't return any valuable value. In order to get informed about the result of this function, the application has to react on the login status of the user.

### Components

## Configuration

The package's behavior can be configured through a call to the `AccountsZimbra.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `createUserIfNotExists`

    Either a Boolean, or a function which returns such a Boolean, defaulting to `false`: if the user doesn't exist in the local accounts database, then he is not created, and thus cannot log-in.

    If a function, it must have following prototype:

    `async createUserIfNotExists( emailAddress<String>, ldap<Object> ): Boolean`.

- `verbosity`

    The verbosity level as:

    - `AccountsZimbra.C.Verbose.NONE`

    or an OR-ed value of integer constants:

    - `AccountsZimbra.C.Verbose.CONFIGURE`

        Trace configuration operations

    Defaults to `AccountsZimbra.C.Verbose.CONFIGURE`.

Please note that `AccountsZimbra.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `AccountsZimbra.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.0.0:

```js
    'lodash': '^4.17.0'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-accounts-zimbra/pulls).

## Cookies and comparable technologies

None at the moment.

---
P. Wieser
- Last updated on 2024, Jan. 5th
