/*
 * pwix:accounts-zimbra/src/common/js/functions.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import _ from 'lodash';

import { Accounts } from 'meteor/accounts-base';
import { EnvSettings } from 'meteor/pwix:env-settings';
import { LDAP } from 'meteor/babrahams:accounts-ldap';
import { Logger } from 'meteor/pwix:logger';
import { Random } from 'meteor/random';
import { ServiceConfiguration } from 'meteor/service-configuration';

const logger = Logger.get();

AccountsZimbra.s = {

    // setup the AccountsZimbra.serviceConfiguration global server variable
    //  + make sure the ServiceConfiguraton Meteor collection ('meteor_accounts_loginServiceConfiguration') is up to date
    async _getServiceConfiguration(){
        // requires AccountsZimbra.s.settings
        AccountsZimbra.s._getSettings();
        // remove the previous version
        await ServiceConfiguration.configurations.removeAsync({ service: AccountsZimbra.C.Service });
        // make sure service configuration has last version from settings
        await ServiceConfiguration.configurations.upsertAsync({ service: AccountsZimbra.C.Service }, { $set: AccountsZimbra.s.settings });
        // and get back this new version of the config
        AccountsZimbra.serviceConfiguration = await ServiceConfiguration.configurations.findOneAsync({ service: AccountsZimbra.C.Service });
        // babrahams:accounts-ldap expects settings in 'ldap' key
        Meteor.settings.ldap = AccountsZimbra.serviceConfiguration;
    },

    // set the AccountsZimbra.s.settings global server variable
    //  idempotent
    async _getSettings(){
        if( !AccountsZimbra.s.settings ){
            const settings = EnvSettings.environmentServerSettings();
            if( settings && settings.private ){
                if( settings.private[AccountsZimbra.C.Service] ){
                    logger.debug( 'set AccountsZimbra.s.settings from private server settings per environment' );
                    AccountsZimbra.s.settings = settings.private[AccountsZimbra.C.Service];
                } else {
                    logger.warn( 'unable to find \''+AccountsZimbra.C.Service+'\' section in private settings' );
                }
            }
        }
    },

    // set the AccountsZimbra.s.settings global server variable
    //  idempotent
    async setupService(){
        await AccountsZimbra.s._getServiceConfiguration();
    }
};

// always use the LDAP server
LDAP.tryDBFirst = false;

// doesn't create the account if it is not found in LDAP
LDAP.alwaysCreateAccountIf = function(){
    return false;
};

// for zimbra, want tranform 'user@domain.com' to 'uid=user,ou=people,dc=domain,dc=com'
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
//  not an account from any particular service - create here a 'zimbra'-service account
LDAP.createUser = async function( userObject, person, extraFields ){
    let serviceData = person;
    serviceData.id = person.dn;
    serviceData.identifiedEmail = userObject.email;
    const res = await Accounts.updateOrCreateUserFromExternalService( AccountsZimbra.C.Service, serviceData );
    await Meteor.users.updateAsync({ _id: res.userId }, { $set: { emails: [
        {
            address: userObject.email,
            verified: false,
            _id: Random.id()
        }
    ]}});
    return res.userId;
};

// doesn't create the account if it doesn't exist in local accounts collection
LDAP.createUserIfNotExists = async function( usernameOrEmail, ldapObject ){
    let fn = AccountsZimbra.configure().createUserIfNotExists;
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

// for zimbra, want tranform 'user@domain.com' to 'dc=com'
LDAP.searchBase = function( searchUsername, server, isEmail, request, settings ){
    const words = searchUsername.split( '@' );
    const domain = words[1].split( '.' );
    return 'dc='+domain[domain.length-1];
}
