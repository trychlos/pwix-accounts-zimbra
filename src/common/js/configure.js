/*
 * pwix:accounts-zimbra/src/common/js/configure.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';

const logger = Logger.get();

let _conf = {};
AccountsZimbra._conf = new ReactiveVar( _conf );

AccountsZimbra._defaults = {
    createUserIfNotExists: false,
    verbosity: AccountsZimbra.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
AccountsZimbra.configure = function( o ){
    if( o && _.isObject( o )){
        // check that keys exist
        let built_conf = {};
        Object.keys( o ).forEach(( it ) => {
            if( Object.keys( AccountsZimbra._defaults ).includes( it )){
                built_conf[it] = o[it];
            } else {
                logger.warn( 'configure() ignore unmanaged key \''+it+'\'' );
            }
        });
        if( Object.keys( built_conf ).length ){
            _conf = _.merge( AccountsZimbra._defaults, _conf, built_conf );
            AccountsZimbra._conf.set( _conf );
            logger.verbose({ verbosity: _conf.verbosity, against: AccountsZimbra.C.Verbose.CONFIGURE }, 'configure() with', built_conf );
        }
    }
    // also acts as a getter
    return AccountsZimbra._conf.get();
}

_conf = _.merge( {}, AccountsZimbra._defaults );
AccountsZimbra._conf.set( _conf );
