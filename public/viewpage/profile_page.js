import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'


export function addEventListeners(){
    Elements.menuProfile.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.PROFILE);
        await profile_page();
    });
}


export async function profile_page(){
    Elements.root.innerHTML = '<h1>Profile Page</h1>';
}