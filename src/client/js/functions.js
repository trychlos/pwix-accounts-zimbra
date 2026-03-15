/*
 * pwix:accounts-zimbra/src/client/js/iziam-client.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import { Accounts } from 'meteor/accounts-base';
import { LDAP } from 'meteor/babrahams:accounts-ldap';

//Accounts.oauth.registerService( AccountsZimbra.C.Service );

const loginWithZimbra = ( options, callback ) => {

    // support a callback without options
    //if( !callback && typeof options === 'function' ){
    //    callback = options;
    //    options = null;
    //}

    //const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler( callback );
    //AccountsZimbra.requestCredential( options, credentialRequestCompleteCallback );

    Meteor.callAsync( 'pwix.AccountsZimbra.m.setupService' ).then(() => {
        const extraFieldData = {};

        const res = Meteor.loginWithLdap( 'pierre@wieser.fr', 'JV56-Xjk98z&', extraFieldData, function ( err, res ){
            if( Meteor.userId()){
                //showForm.set(false);
                LDAP.onSuccessfulLogin( Meteor.user());
                return true;
            }
            else {
                //firstAttempt.set(false);
                if( err && err.error === 401 ){
                    alert("If you don't have an account provided, you need to sign in using an email address");
                }
                return false;
            }
        });
    });
};

Accounts.registerClientLoginFunction( AccountsZimbra.C.Service, loginWithZimbra );

Meteor.loginWithZimbra = ( ...args ) => Accounts.applyLoginFunction( AccountsZimbra.C.Service, args );
