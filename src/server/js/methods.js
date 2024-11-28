/*
 * pwix:accounts-zimbra/src/common/js/methods.js
 */

Meteor.methods({
    async 'pwix_accounts_zimbra_setup_service'(){
        await AccountsZimbra.s.setupService();
    }
});
