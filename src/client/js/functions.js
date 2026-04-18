/*
 * pwix:accounts-zimbra/src/client/js/iziam-client.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import _ from 'lodash';

import { Accounts } from 'meteor/accounts-base';
import { LDAP } from 'meteor/pwix:accounts-ldap';
import { Logger } from 'meteor/pwix:logger';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tolert } from 'meteor/pwix:tolert';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

// the service configuration is setup server-side as soon as we have got the JSON settings
// should show here the signin panel

const loginWithZimbra = ( options, callback, data ) => {
    const res = Meteor.loginWithLdap( data.email, data.password, {}, function ( err, res ){
        if( Meteor.userId()){
            LDAP.onSuccessfulLogin( Meteor.user());
            // close the modal
            Modal.topmost().close();
            // cleanup the DOM
            _cleanupDOM();
            return true;
        }
        else {
            logger.warning( 'err', err, 'res', res );
            //if( err && err.error === 401 ){
            //    alert("If you don't have an account provided, you need to sign in using an email address");
            //}
            Tolert.error( pwixI18n.label( I18N, 'result.error' ));
            return false;
        }
    });
};

Accounts.registerClientLoginFunction( AccountsZimbra.C.Service, loginWithZimbra );

Meteor.loginWithZimbra = ( ...args ) => Accounts.applyLoginFunction( AccountsZimbra.C.Service, args );

// cleanup the DOM when the modal is closed
const _cleanupDOM = function(){
    $( '.acUserLogin[data-ac-name="loginWithZimbra"]' ).remove();
};

// whether the currently logged-in user has been authenticated with Zimbra/Carbonio
const _isZimbraUser = function( connection ){
    const userDoc = connection.userDoc();
    return Boolean( userDoc?.services?.zimbra );
};

Meteor.startup(() => {
    Tracker.autorun(() => {
        // set a hook on dropdown menu items
        // when logged-in and the user authentication comes from us (from Zimbra/Carbonio LDAP)n then disable the password change
        // when unlogged, then add our login item
        if( Package['pwix:accounts-ui'] && Package['pwix:accounts-ui'].AccountsUI.ready()){
            const AccountsUI = Package['pwix:accounts-ui'].AccountsUI;

            // install a menu items hook
            AccountsUI.onRebuildMenuItems( async ( items, opts ) => {
                //console.warn( 'onRebuildMenuItems', items, opts );
                const connection = AccountsUI.Connection;
                switch( connection.state()){
                    case AccountsUI.C.Connection.LOGGED:
                        if( _isZimbraUser( connection )){
                            for( let i=0 ; i<items.length ; ++i ){
                                let it = items[i];
                                if( it.match( /ac-changepwd/ )){
                                    items[i] = it.replace( /ac-changepwd/, 'ac-changepwd disabled' );
                                    break;
                                }
                            }
                        }
                        break;

                    // when unlogged, have login with zimbra
                    case AccountsUI.C.Connection.UNLOGGED:
                        let label = AccountsZimbra.configure().itemLabel;
                        if( _.isFunction( label )){
                            label = label();
                        }
                        let logo = AccountsZimbra.configure().itemLogo;
                        if( _.isFunction( logo )){
                            logo = logo();
                        }
                        items.push( '<hr class="dropdown-divider">' );
                        items.push( '<a class="dropdown-item d-flex align-items-center justify-content-start ac-dropdown-item" href="#" data-ac-event="ac-zimbra-signin"><img class="ac-zimbra-img" src="'+logo+'" /><p>'+label+'</p></a>' );
                        break;
                }

                // returns the new items
                return items;
            });

            // install events handler
            $( document ).on( 'ac-zimbra-signin', '.acUserLogin', function( event, data ){
                zimbraGetCredentials( data.AC );
            });
        }
    });
});

// get user credentials from the UI
// and tries to connect
// may accept the acUserLogin 'AC' object when a dropdown item has been clicked - no parameter is provided when clicking on a button
const zimbraGetCredentials = function(){
    if( Package['pwix:accounts-ui'] && Package['pwix:accounts-ui'].AccountsUI.ready()){
        const AccountsUI = Package['pwix:accounts-ui'].AccountsUI;
        const view = Blaze.renderWithData( Template.acUserLogin, {
            name: 'loginWithZimbra',
            initialDisplay: AccountsUI.C.Panel.SIGNIN,
            renderMode: AccountsUI.C.Render.MODAL,
            signupLink: false,
            resetLink: false,
            signinTitle: AccountsZimbra.configure().modalTitle,
            async signinSubmitFn( email, password, data ){
                Meteor.loginWithZimbra( null, null, { email, password });
            }
        }, $( 'body' )[0] );
        //logger.debug( Modal.topmost());
    }
}
