/*
 * pwix:accounts-zimbra/src/common/js/configure.js
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';

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
        _conf = _.merge( AccountsZimbra._defaults, _conf, o );
        AccountsZimbra._conf.set( _conf );
        // be verbose if asked for
        if( _conf.verbosity & AccountsZimbra.C.Verbose.CONFIGURE ){
            console.log( 'pwix:accounts-zimbra configure() with', o );
        }
    }
    // also acts as a getter
    return AccountsZimbra._conf.get();
}

_conf = _.merge( {}, AccountsZimbra._defaults );
AccountsZimbra._conf.set( _conf );
