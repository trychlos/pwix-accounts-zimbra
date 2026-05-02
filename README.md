# pwix:accounts-zimbra

## What is it ?

A Meteor login service for the Zimbra or Carbonio CE LDAP directory.

On client side, this package defines `Meteor.loginWithZimbra()` function.

## How does that work ?

[Zimbra](https://zimbra.com) used to be an open-source email manager, is now close source.

[Carbonio](https://zextras.com/carbonio-community-edition) is an open-source email manager, which relies on an internal LDAP directory. We can take advantage of it to authenticate a user with his/her email address.

Taking advantage of this LDAP directory to check an identity is rather straightforward, though it has unfortunately the drawback of not embedding any external application authorization.

There is so a configuration option to automatically add some roles to every user created this way.

Standard Zimbra LDAP directory returns a person object like:

```js
    person {
        dn: 'uid=radical,ou=people,dc=example,dc=com',
        controls: [],
        displayName: ' My Surname Name',
        givenName: ' Surname',
        cn: ' Surname',
        objectClass: [ 'inetOrgPerson', 'zimbraAccount', 'amavisAccount' ],
        mail: [
            'radical@example.com',
            'alias@another.two',
            'stillalias@three.xx'
        ],
        sn: 'radical',
        uid: 'radical'
    }
```

## Settings

You should setup your `settings.json` server-side with following schema:

```json
    {
        "packages": {
            "pwix:accounts-zimbra": {
                "global": "AccountsZimbra",
                "conf": {
                    "addRoles": [
                        ...
                    ],
                    "autoVerifyEmail": false,
                    "createLocalUserIfBindFailed": false,
                    "createLocalUserIfNotExists": true,
                    "serverUrl": "localhost:389",
                    "serverDn": "cn=zimbra"
                }
            }
        }
    }
```

This way, the package is automatically configured with the specified parameters.

## Provides

`pwix:accounts-zimbra` exports a global `AccountsZimbra` object.

### Functions

#### `AccountsZimbra.configure( o<Object> )`

See [below](#configuration)

#### `AccountsZimbra.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

#### `Meteor.loginWithZimbra( options<Object>, ( err ) => {})`

An async function which starts the login OpenID flow. It doesn't return any valuable value. In order to get informed about the result of this function, the application has to react on the login status of the user.

### Components

#### ZimbraLoginButton

This is a button which triggers the SIGNIN AccountsUI panel.

It honors following arguments:

- `label`: the label of the button, defaulting to the configured `itemLabel` value.

- `logo`: a logo associated to the button, defaulting to the configured `itemLogo` value.

- `title`: the title of the button, defaulting to the configured `itemTitle` value.

## Configuration

The package's behavior can be configured through a call to the `AccountsZimbra.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `addRoles`

    The roles to be assigned to every newly created user account, defaulting to none.

    Either an array or a function which returns such an array, where each item can be:

    - either a string, the global role name to be assigned,

    - or an object with following keys:

        - `role`: the role name to be assigned

        - `scope`: the scope identifier.
    
    When a function, its prototype must be `async fn(  emailAddress<String>, ldap<Object> ): Array`.

    This parameter is only honored if the application uses the `aldeed:roles` package.

- `autoVerifyEmail`

    Whether the email address is automatically set as verified when creating the user from LDAP data, defaulting to `false`.

    Either a Boolean, or a function which returns such a Boolean. If a function, it must have following prototype:

    `async fn( emailAddress<String>, ldap<Object> ): Boolean`.

- `createLocalUserIfBindFailed`

    Either a Boolean, or a function which returns such a Boolean, defaulting to `false`: if the user cannot be retrieved from LDAP, then the account is not created and the login is refused.

    If a function, it must have following prototype:

    `async fn( emailAddress<String>, ldap<Object> ): Boolean`.

- `createLocalUserIfNotExists`

    Either a Boolean, or a function which returns such a Boolean, defaulting to `true`: if the user doesn't exist in the local accounts database, then the account is created. This is required by Meteor ecosystems to have resume and login tokens inside of the `users` collection.

    If a function, it must have following prototype:

    `async fn( emailAddress<String>, ldap<Object> ): Boolean`.

    Whether the user account is created in the local `users` collection or not doesn't prevent it to successfully log-in. But, obviously, he/she will not take advantage of any roles assignments or other account local attributes.

- `itemLabel`

    The label of the menu item, defaulting to the configured value (localized) 'Login with Zimbra'.

    Can be a function which takes no argument and returns a string.

- `itemLogo`

    A logo associated to the menu item, defaulting to transparent Zimbra short logo.

    Can be a function which takes no argument and returns a string.

- `itemTitle`

    The title of the menu item, defaulting to (localized) 'Login with Zimbra LDAP directory'

    Can be a function which takes no argument and returns a string.

- `logging`

    Whether the underlying `pwix:accounts-ldap` package should be verbose, defaulting to `false`.

    Either a Boolean, or a function which returns such a Boolean. If a function, it must have following prototype: `fn(): Boolean`.

- `modalTitle`

    The title of the modal signin dialog, defaulting to (localized) 'Signin with my Zimbra email address'

    Can be a function which takes no argument and returns a string.

- `serverDn`

    The base DN to search for the user in the LDAP server, defaulting to empty.

- `serverUrl`

    The URL of the LDAP server, defaulting to 'ldap://localhost:389'.

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

Dependencies as of v 1.1.0:

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
- Last updated on 2026, May. 2nd
