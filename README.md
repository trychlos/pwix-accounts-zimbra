# pwix:accounts-zimbra

## What is it ?

A login service for izIAM(©) Identity and Access Manager accounts which implements [OpenID Connect 1.0](https://openid.net/specs/openid-connect-core-1_0.html) login flow.

This package is based on:

- [accounts-github](https://github.com/meteor/meteor/tree/devel/packages/accounts-github)
- [salleman:accounts-oidc](https://github.com/salleman33/meteor-accounts-oidc/tree/master/packages/switch_accounts-oidc) v 1.0.12
- [Meteor documentation](https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E)

On client side, this package defines `Meteor.loginWithZimbra()` function.

## How does that work ?

The application which does want take advantage of the izIAM Identity and Access Manager to manage its users accounts must first register as a client against izIAM.

Once registered, it gets a `ClientId` and a client secret.

It now has to:

- include the `iziamLoginButton` component in the ad-hoc place of its pages

- define the needed configuration as a private JSON structure in its server settings, for example in a `private/config/server/environments.json` file:

```json
    "<appname>": {
        "environments": {
            "<environment>": {
                "private": {
                    "iziam": {
                        "comments": [
                            "openbook-dev to iziam-dev - test user for auth code grant flow"
                        ],
                        "loginStyle": "popup",
                        "popupOptions": "{ width: 900, height: 450 }",
                        "issuerUrl": "http://localhost:3003/iziam",
                        "client_id": "6eb26be8c55b44f48f2d046232e8cfac",
                        "client_secret": "edsfvgrtyhujhngbnhjkui3456789okjgfb098765432xwdcfvghjk87654xcfvgh_7654DFGH",
                        "redirect_uri": "https://slim14.trychlos.lan/_oauth/iziam",
                        "scopes": [
                            "openid",
                            "offline_access"
                        ]
                    }
                }
            },
```

This configuration manages:

- the style and size of the login dialog:

    - `loginStyle`: either `popup` or `redirect`, defaulting to `popup`.

    - `popupOptions`: any style option to be given to the popup, defaulting to `{ width: 900, height: 450 }`.

- the izIAM configuration:

    - `issuerUrl`: MANDATORY - the URL of the izIAM.

- the client configuration which must match the izIAM registration:

    - `client_id`: MANDATORY - the client identifier issued at registration time

    - `client_secret`: if the client wants authenticate against the token endpoint

    - `redirect_uri`: one of the pre-registered allowed redirection URIs

    - `resources`: one or more resources asked by your client application, defaulting to `[]`

    - `scopes`: one or more scopes your client application wants use, defaulting to `[ "openid" ]`

    - `token_endpoint_auth_method`: the client authentication method, defaulting to `client_secret_basic`

## Provides

### Functions

#### `Meteor.loginWithIzIAM( options<Object>, ( err ) => {})`

An async function which starts the login OpenID flow. It doesn't return any valuable value. In order to get informed about the result of this function, the application has to react on the login status of the user.

### Components

#### `iziamChangeButton`

A "change password" button Blaze template to be called with following data context:

- `btnClasses`

    A list of classes to be added to the button, defaulting to `btn-outline-primary`;

- `btnLabel`

    The button label, defaulting to (translated) 'Change password'.

#### `iziamLoginButton`

A login button Blaze template to be called with following data context:

- `btnClasses`

    A list of classes to be added to the button, defaulting to `btn-outline-primary`;

- `btnLabel`

    The button label, defaulting to (translated) 'Login with izIAM'.

- `withLabel`

    Whether we want display a label in the button, defaulting to `true`.

- `withLogo`

    Whether we want display the izIAM logo in the button, defaulting to `true`.

- `iziamOptions`

    An options object to be passed to `pwix:iziam-oidc` package and which may contain any `openid-client` option.

#### `iziamLogoutButton`

A logout button Blaze template to be called with following data context:

- `btnClasses`

    A list of classes to be added to the button, defaulting to `btn-outline-primary`;

- `btnLabel`

    The button label, defaulting to (translated) 'Logout'.

This is for consistency reason only, and in anyway not mandatory to use. Clicking on the button actually just triggers the `Meteor.logout()` standard function.

## Configuration

None at the moment.

## NPM peer dependencies

None at the moment.

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-accounts-zimbra/pulls).

## Cookies and comparable technologies

None at the moment.

---
P. Wieser
- Last updated on 2024, Jan. 5th
