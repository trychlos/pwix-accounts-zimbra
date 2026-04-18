/*
 * pwix:accounts-zimbra/src/common/js/functions.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 * 
 * Manage here
 * - service configuration
 * - LDAP access.
 */

import _ from 'lodash';

import { Accounts } from 'meteor/accounts-base';
import { EnvSettings } from 'meteor/pwix:env-settings';
import { LDAP } from 'meteor/pwix:accounts-ldap';
import { Logger } from 'meteor/pwix:logger';
import { Random } from 'meteor/random';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

// track the configuration updating the service accordingly
Tracker.autorun( async () => {
    if( EnvSettings.ready()){
        //logger.debug( 'AccountsZimbra', AccountsZimbra.configure());
        const conf = AccountsZimbra.configure();
        // remove the previous version
        await ServiceConfiguration.configurations.removeAsync({ service: AccountsZimbra.C.Service });
        // make sure service configuration has last version from settings
        await ServiceConfiguration.configurations.upsertAsync({ service: AccountsZimbra.C.Service }, { $set: conf });
        // and get back this new version of the config
        AccountsZimbra.serviceConfiguration = await ServiceConfiguration.configurations.findOneAsync({ service: AccountsZimbra.C.Service });
        // babrahams:accounts-ldap expects settings in 'ldap' key
        Meteor.settings.ldap = AccountsZimbra.serviceConfiguration;
        // whether we want babrahams:accounts-ldap be verbose
        let _logging = conf.logging || false;
        if( _.isFunction( _logging )){
            _logging = _logging();
        }
        LDAP.logging = _logging;
    }
});

// whether the email address is automatically set as verified when creating a new user from LDAP data
const _autoVerifyEmail = async function( userObject, person ){
    let autoVerify = AccountsZimbra.configure().autoVerifyEmail;
    if( autoVerify && _.isFunction( autoVerify )){
        autoVerify = await fn( userObject, person );
    }
    return autoVerify;
};

// always use the LDAP server
LDAP.tryDBFirst = false;

// for zimbra/carbonio, want tranform 'user@domain.com' to 'uid=user,ou=people,dc=domain,dc=com'
LDAP.bindValue = function( usernameOrEmail, isEmailAddress, FQDN ){
    const words = usernameOrEmail.split( '@' );
    const domain = words[1].split( '.' );
    let value = 'uid='+words[0]+',ou=people';
    for ( const w of domain ){
        value += ',dc='+w;
    }
    return value;
}

// babrahams:accounts-ldap defaults to create a "standard" user account with a password
//  not an account from any particular service - create here a 'carbonio'-service account instead
// only called if 'createLocalUserIfNotExists' configuration option is true
// https://github.com/meteor/meteor/blob/devel/packages/accounts-base/accounts_server.js:
//  Must include an "id" field which is a unique identifier for the user in the service.
LDAP.createUser = async function( userObject, person, extraFields ){
    logger.debug( 'createUser()', arguments );
    let serviceData = person;
    serviceData.id = person.dn;
    delete serviceData.dn;
    delete serviceData.controls;
    delete serviceData.givenName;
    delete serviceData.cn;
    delete serviceData.sn;
    delete serviceData.uid;
    serviceData.displayName = _.trim( serviceData.displayName );
    const res = await Accounts.updateOrCreateUserFromExternalService( AccountsZimbra.C.Service, serviceData );
    await Meteor.users.updateAsync({ _id: res.userId }, { $set: { emails: [
        {
            address: userObject.email,
            verified: await _autoVerifyEmail( userObject, person ),
            _id: Random.id()
        }
    ]}});
    return res.userId;
};

// whether create the local account if we are unable to find it in LDAP
LDAP.createUserIfBindFailed = async function( usernameOrEmail, ldapObject ){
    let fn = AccountsZimbra.configure().createUserIfBindFailed;
    if( fn && _.isFunction( fn )){
        fn = await fn( usernameOrEmail, ldapObject );
    }
    return Boolean( fn );
};

// whether create the local account if it doesn't exist yet in local accounts collection is a configuration option
LDAP.createUserIfNotExists = async function( usernameOrEmail, ldapObject ){
    let fn = AccountsZimbra.configure().createLocalUserIfNotExists;
    if( fn && _.isFunction( fn )){
        fn = await fn( usernameOrEmail, ldapObject );
    }
    return Boolean( fn );
};

LDAP.filter = function( isEmailAddress, usernameOrEmail, FQDN, settings ){
    const searchFilter = '(&(objectClass=zimbraAccount)(mail=' +usernameOrEmail + '))';
    LDAP.log('Search filter: ' + searchFilter);
    return searchFilter;
};

// for zimbra/carbonio, want tranform 'user@domain.com' to 'dc=com'
LDAP.searchBase = function( searchUsername, server, isEmail, request, settings ){
    const words = searchUsername.split( '@' );
    const domain = words[1].split( '.' );
    return 'dc='+domain[domain.length-1];
}

// have a callback on successful signin
//  no relevant arguments detected (currentModule, parentModule, waitForDepsFunction, finishFunction)
LDAP.onSignIn( function(){
    logger.debug( 'onSignIn()', arguments );
});
