/*
 * pwix:accounts-zimbra/src/client/js/iziam-client.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import { Accounts } from 'meteor/accounts-base';
import { izIAM } from 'meteor/pwix:iziam-oidc';

Accounts.oauth.registerService( izIAM.C.Service );

const loginWithIzIAM = ( options, callback ) => {

    // support a callback without options
    if( !callback && typeof options === 'function' ){
        callback = options;
        options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler( callback );
    izIAM.requestCredential( options, credentialRequestCompleteCallback );
};

Accounts.registerClientLoginFunction( izIAM.C.Service, loginWithIzIAM );

Meteor.loginWithIzIAM = ( ...args ) => Accounts.applyLoginFunction( izIAM.C.Service, args );
