/*
 * pwix:accounts-zimbra/src/client/components/ZimbraLoginButton/ZimbraLoginButton.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';

import './ZimbraLoginButton.html';

const logger = Logger.get();

Template.ZimbraLoginButton.onCreated( function(){
    logger.debug( this );
});

Template.ZimbraLoginButton.helpers({
    // text translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // the button logo
    img(){
        if( this.logo ){
            return this.logo;
        }
        let value = AccountsZimbra.configure().itemLogo;
        if( _.isFunction( value )){
            value = value();
        }
        return value;
    },

    // the button label
    label(){
        if( this.label ){
            return this.label;
        }
        let value = AccountsZimbra.configure().itemLabel;
        if( _.isFunction( value )){
            value = value();
        }
        return value;
    },

    // the button title
    title(){
        if( this.title ){
            return this.title;
        }
        let value = AccountsZimbra.configure().itemTitle;
        if( _.isFunction( value )){
            value = value();
        }
        return value;
    }
});

// /packages/pwix_accounts-zimbra/resources/png/carbonio-logo-transparent.png

Template.ZimbraLoginButton.events({
    'click .ZimbraLoginButton button'( event, instance ){
        zimbraGetCredentials();
    }
});
