/*
 * pwix:accounts-zimbra/src/common/js/iziam-server.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import { Accounts } from 'meteor/accounts-base';
import { izIAM } from 'meteor/pwix:iziam-oidc';

Accounts.oauth.registerService( izIAM.C.Service );

Accounts.addAutopublishFields({
    forLoggedInUser: [ 'services.'+izIAM.C.Service ],
    forOtherUsers: [ 'services.'+izIAM.C.Service+'.username' ]
});
