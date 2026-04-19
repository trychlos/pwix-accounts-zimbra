/*
 * pwix:accounts-zimbra/src/common/js/functions.js
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { LDAP } from 'meteor/pwix:accounts-ldap';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

/**
 * @locus Anywhere
 * @param {String|Object} user
 * @param {String} password
 * @returns {Boolean} whether the user can be authenticated authenticated against the Zimbra/Carbonio LDAP directory
 */
AccountsZimbra.authenticate = async function( user, password ){
    return await LDAP.authenticate( user, password );
}

/**
 * @locus Anywhere
 * @param {String|Object} user
 * @returns {Boolean} whether the user is a Zimbra user, i.e. has been created in the local accounts database after having been authenticated against the Zimbra/Carbonio LDAP directory
 */
AccountsZimbra.isZimbraUser = async function( user ){
    if( user ){
        let userDoc = user;
        if( _.isString( user )){
            const acInstance = AccountsCore.getInstance( 'users' );
            if( !acInstance || !( acInstance instanceof AccountsCore.Account )){
                logger.warning( 'unable to get the \'users\' instance' );
                return false;
            }
            userDoc = await acInstance.byAnyIdentifier( user );
            if( !userDoc || !userDoc._id ){
                logger.warning( 'unable to get a user document for \''+user+'\'' );
                return false;
            }
        }
        const isZimbra = Boolean( userDoc && userDoc.DYN?.services && userDoc.DYN.services.includes( 'zimbra' ));
        return isZimbra;
    }
    return false;
}
