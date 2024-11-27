Package.describe({
    name: 'pwix:accounts-zimbra',
    version: '1.0.0-rc',
    summary: 'A Meteor package to let a user identifies and autenticates against the Zimbra LDAP directory',
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
    api.versionsFrom([ '2.9.0', '3.0-rc.1' ]);
    //api.use( 'accounts-base@3.0.1', ['client', 'server'] );
    //api.use( 'accounts-oauth', ['client', 'server']);
    api.use( 'blaze-html-templates@3.0.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'pwix:i18n@1.5.2' );
    api.use( 'tmeasday:check-npm-versions@2.0.0-beta.0', 'server' );
}

// NPM dependencies are checked in /src/server/js/check_npms.js
// See also https://guide.meteor.com/writing-atmosphere-packages.html#npm-dependencies
