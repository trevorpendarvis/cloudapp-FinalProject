import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Profile from './profile_page.js'
import * as Auth from '../controller/auth.js'




export function addEventListeners(){
    Elements.menuWallet.addEventListener('click', async () => {
        if(!Profile.accountInfo || !Profile.accountInfo.creditNo){
            Util.info('Sorry looks like you dont have a payment method','To add a payment method go to profile and enter a valid credit card.');
            return;
        }
        Elements.addFundsForm.reset();
        Elements.addFundsModal.show();
    });


    Elements.addFundsForm.addEventListener('submit', async e => {
        e.preventDefault();
        const addAmount = Number(e.target.amount.value);
        const currentAmount = Profile.accountInfo.currentBalence;
        let newAmount = addAmount+currentAmount;
        try {
            const updateInfo = {};
            updateInfo['currentBalence'] = newAmount;
            await FirebaseController.updateAccount(Auth.currentUser.uid,updateInfo);
            Util.info('Success!',`${Util.currency(addAmount)} added to your account`,Elements.addFundsModal);
            Elements.walletAmount.innerHTML = Util.currency(newAmount);
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('add funds error',JSON.stringify(e),Elements.addFundsModal);
        }
        await Profile.updateAccountBalence(newAmount);
    });
}



export async function profileAddfunds(){
    if(!Profile.accountInfo || !Profile.accountInfo.creditNo){
        Util.info('Sorry looks like you dont have a payment method','To add a payment method go to profile and enter a valid credit card.');
        return;
    }
    Elements.addFundsForm.reset();
    Elements.addFundsModal.show();
}