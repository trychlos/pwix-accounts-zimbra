/*
 * pwix:accounts-zimbra/src/common/js/functions.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import _ from 'lodash';

import { Accounts } from 'meteor/accounts-base';

import { EnvSettings } from 'meteor/pwix:env-settings';
import { LDAP } from 'meteor/babrahams:accounts-ldap';
import { ServiceConfiguration } from 'meteor/service-configuration';

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
                    console.debug( 'set AccountsZimbra.s.settings from private server settings per environment' );
                    AccountsZimbra.s.settings = settings.private[AccountsZimbra.C.Service];
                } else {
                    console.warn( 'unable to find \''+AccountsZimbra.C.Service+'\' section in private settings' );
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
LDAP.alwaysCreateAccountIf = function (){
    return false;
};

LDAP.filter = function ( isEmailAddress, usernameOrEmail, FQDN, settings ){
    const searchFilter = '(&(objectClass=zimbraAccount)(mail=' +usernameOrEmail + '))';
    //const searchFilter = '(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=' +usernameOrEmail + '))';
    LDAP.log('Search filter: ' + searchFilter);
    return searchFilter;
};
