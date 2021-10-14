import * as Auth from './controller/auth.js'
import * as Home from './viewpage/home_page.js'
import * as Cart from './viewpage/cart.js'
import * as Profile from './viewpage/profile_page.js'
import * as Purchases from './viewpage/purchases_page.js'
import * as Route from './controller/routes.js'

Auth.addEventListeners();
Home.addEventListeners();
Cart.addEventListeners();
Profile.addEventListeners();
Purchases.addEventListeners();


window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    Route.routing(pathname,hash);
};

window.addEventListener('popstate', e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    const hash = e.target.location.hash;
    Route.routing(pathname,hash);
});