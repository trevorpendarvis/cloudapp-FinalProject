import * as Elements from '../viewpage/elements.js'
import * as FirebaseController from './firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Constant from '../model/constant.js'


export let currentUser;

export function addEventListeners(){
    Elements.signInForm.addEventListener('submit',async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            await FirebaseController.signIn(email,password);
            Elements.signInModal.hide();
        } catch (e) {
            if(Constant.DEV)console.log(e);
            Util.info('Sign in error',JSON.stringify(e),Elements.signInModal);
        }
    });



    Elements.menuSignOut.addEventListener('click',async () => {
        try {
            await FirebaseController.signOut();
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Sign out error',JSON.stringify(e));
        }
    });



    firebase.auth().onAuthStateChanged(async user => {
        //signed in
        if(user){
            currentUser = user;
            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
            elements = document.getElementsByClassName('modal-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }
        }
        //signed ou
        else{
            currentUser = null;

            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }
            elements = document.getElementsByClassName('modal-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
        }
    });
}