import * as Elements from '../viewpage/elements.js'
import * as FirebaseController from './firebase_controller.js'

export function addEventListeners(){
    Elements.signInForm.addEventListener('submit',async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            await FirebaseController.signIn(email,password);
            Elements.signInModal.hide();
        } catch (e) {
            console.log(e);
        }
    });
}