import * as Elements from '../viewpage/elements.js'
import * as FirebaseController from './firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Constant from '../model/constant.js'
import * as Route from './routes.js'
import * as Home from '../viewpage/home_page.js'


export let currentUser;

export function addEventListeners(){
    Elements.signInForm.addEventListener('submit',async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);

        try {
            await FirebaseController.signIn(email,password);
           // await Util.sleep(1000);
            Elements.signInModal.hide();
        } catch (e) {
            if(Constant.DEV)console.log(e);
            Util.info('Sign in error',JSON.stringify(e),Elements.signInModal);
        }

        e.target.email.value = '';
        e.target.password.value = '';
        Util.enableButton(button,label);
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

            Home.initShoppingCart();


            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
            elements = document.getElementsByClassName('modal-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }

            Route.routing(window.location.pathname,window.location.hash);
        }
        //signed out
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

            history.pushState(null,null,Route.routePathnames.HOME);
            Route.routing(window.location.pathname,window.location.hash);
        }
    });
}