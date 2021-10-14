import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'


export function addEventListeners(){
    Elements.menuPurchases.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.PURCHASES);
        await purchases_page();
    });
}


export async function purchases_page(){
    Elements.root.innerHTML = '<h1>Purchases Page</h1>';
}