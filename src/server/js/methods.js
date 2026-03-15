/*
 * pwix:accounts-zimbra/src/common/js/methods.js
 */

Meteor.methods({
    async 'pwix.AccountsZimbra.m.setupService'(){
        await AccountsZimbra.s.setupService();
    }
});
