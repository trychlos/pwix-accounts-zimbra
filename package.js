Package.describe({
    name: 'pwix:accounts-zimbra',
    version: '1.0.0',
    summary: 'A Meteor package to let a user authenticates against a Zimbra/Carbonio CE LDAP directory',
    git: 'https://github.com/trychlos/pwix-accounts-zimbra.git',
    documentation: 'README.md'
});

Package.onUse( function( api ){
    configure( api );
    api.mainModule( 'src/client/js/index.js', 'client' );
    api.mainModule( 'src/server/js/index.js', 'server' );
});

Package.onTest( function( api ){
    configure( api );
    api.use( 'tinytest' );
    api.use( 'pwix:accounts-zimbra' );
    api.mainModule( 'test/js/index.js' );
});

function configure( api ){
    api.versionsFrom([ '2.9.0', '3.0' ]);
    api.export([
        'AccountsZimbra'
    ]);
    api.use( 'accounts-base' );
    api.use( 'blaze-html-templates@3.0.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'pwix:accounts-ldap@0.10.0' );
    api.use( 'pwix:accounts-ui@2.2.0', { weak: true });
    api.use( 'pwix:env-settings-ext@1.2.0' );
    api.use( 'pwix:i18n@1.5.2' );
    api.use( 'pwix:logger@1.0.0-rc' );
    api.use( 'pwix:modal@2.5.0' );
    api.use( 'pwix:roles@1.5.0', { weak: true });
    api.use( 'pwix:tolert@1.5.0' );
    api.use( 'reactive-var' );
    api.use( 'service-configuration' );
    api.use( 'tmeasday:check-npm-versions@2.0.0-beta.0', 'server' );
    api.addFiles( 'src/client/components/ZimbraLoginButton/ZimbraLoginButton.js', 'client' );
    api.addAssets([
        'resources/png/carbonio-logo-transparent.png',
        'resources/png/zimbra-logo-transparent.png'
    ], 'client' );
}

// NPM dependencies are checked in /src/server/js/check_npms.js
// See also https://guide.meteor.com/writing-atmosphere-packages.html#npm-dependencies
