import * as Elements from '../viewpage/elements.js'
import * as FirebaseController from './firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Constant from '../model/constant.js'
import * as Route from './routes.js'
import * as Home from '../viewpage/home_page.js'
import * as Profile from '../viewpage/profile_page.js'


export let currentUser;
export let isAdmin = false;

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
            if(!Constant.adminEmails.includes(user.email)){
            Elements.bannerTitle.innerHTML = 'Client';
            await Profile.getAccountInfo(user);
            Home.initShoppingCart();


            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
            elements = document.getElementsByClassName('client-navbar-elements-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }
            Route.routing(window.location.pathname,window.location.hash);
        }else{
            isAdmin = true;
            Elements.bannerTitle.innerHTML = 'Admin';
            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }

            elements = document.getElementsByClassName('admin-navbar-elements-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }
            history.replaceState(null,null,Route.routePathnames.ADMIN);
            Route.routing(Route.routePathnames.ADMIN,window.location.hash);
        }

            
        }
        //signed out
        else{
            currentUser = null;
            if(!isAdmin){
            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }
            elements = document.getElementsByClassName('client-navbar-elements-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
        }else{
            isAdmin = false;
            let elements = document.getElementsByClassName('modal-pre-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'block';
            }
            elements = document.getElementsByClassName('admin-navbar-elements-post-auth');
            for(let i = 0; i < elements.length; i++){
                elements[i].style.display = 'none';
            }
        }
            Elements.bannerTitle.innerHTML = '';
            history.pushState(null,null,Route.routePathnames.HOME);
            Route.routing(window.location.pathname,window.location.hash);
        }
    });




    Elements.signUpButton.addEventListener('click', () => {
        Elements.signInModal.hide();
        Elements.signUpForm.reset();
        Elements.signUpFormPasswordError.innerHTML = '';
        Elements.signUpModal.show();
    });



    Elements.signUpForm.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confrimPassword = e.target.passwordConfirm.value;

        Elements.signUpFormPasswordError.innerHTML = '';

        if(password != confrimPassword){
            Elements.signUpFormPasswordError.innerHTML = 'The passwords do not match';
            return;
        }

        try {
            await FirebaseController.createUser(email,password);
            Util.info('Account created',`You are now signed in using ${email}`,Elements.signUpModal)
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Failed to create an account',JSON.stringify(e), Elements.signUpModal);
        }

    });


    
}