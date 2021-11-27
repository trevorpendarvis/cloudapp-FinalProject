import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import * as Home from './home_page.js'
import * as Profile from './profile_page.js'


export function addEventListeners() {
    Elements.menuCart.addEventListener('click', async () => {
        history.pushState(null, null, Route.routePathnames.CART);
        await cart_page();
    });
}


export async function cart_page() {
    if (!Auth.currentUser) {
        Elements.root.innerHTML = '<h1>Protected Page</h1>';
        return;
    }



    let html = '<h1>Shopping cart</h1>';
    const cart = Home.cart;

    if (!cart || cart.getTotalCount() == 0) {
        Elements.root.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                                        <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                        </symbol>
                                    </svg>
                                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                                        <div>
                                            Shopping Cart is Empty
                                        </div>
                                    </div>`;
        
        return;
    }


    html += `
    <table class="table table-dark table-striped table-hover">
    <thead>
      <tr>
        <th scope="col">Image</th>
        <th scope="col">Name</th>
        <th scope="col">Unit Price</th>
        <th scope="col">Quantity</th>
        <th scope="col">Sub-Total</th>
        <th scope="col" width="50%">Summary</th>
      </tr>
    </thead>
    <tbody>
    `;

    cart.items.forEach(item => {
        html += `
            <tr>
                <td><img src="${item.imageURL}" width="150px"></td>
                <td>${item.name}</td>
                <td>${Util.currency(item.price)}</td>
                <td>${item.qty}</td>
                <td>${Util.currency(item.qty * item.price)}</td>
                <td>${item.summary}</td>
            </tr>
        `;
    });


    html += `</tbody>
                <tfoot>
                    <tr>
                        <td colspan="1"><h3>Total:</h3><td>
                        <td colspan="5"><h3>${Util.currency(cart.getTotalPrice())}</h3></td>
                    </tr>
                </tfoot>
            </table>

    `;

    html += `
        <div class="d-flex justify-content-center">
            <button id="btn-checkout" class="btn btn-outline-success">Check Out</button>
            <button id="btn-continue-shopping" class="btn btn-outline-info">Continue Shopping</button>
        </div>
    `;
    Elements.root.innerHTML = html;

    const continueShopping = document.getElementById('btn-continue-shopping');
    continueShopping.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.HOME);
        await Home.home_page();
    });

    const checkout = document.getElementById('btn-checkout');
    checkout.addEventListener('click',async () => {
        const currentBalence = Profile.accountInfo.currentBalence;
        const totalPrice = cart.getTotalPrice();
        if(!Profile.checkPaymentMethod()){
            Util.info('Sorry looks like you dont have a payment method','To add a payment method go to profile and enter a valid credit card.');
            return;
        }else if(!Profile.checkFunds(totalPrice)){
            Util.info('Insufficient funds',`You only have ${Util.currency(currentBalence)} in your wallet, you need to add ${Util.currency(totalPrice-currentBalence)} if you want to checkout`);
            return;
        }

        

        const updateInfo = {};
        let newBalence = currentBalence - totalPrice;
        newBalence = Number(newBalence.toFixed(2));        
        updateInfo['currentBalence'] = newBalence;
        



        const label = Util.disableButton(checkout);
       try {
            await FirebaseController.updateAccount(Auth.currentUser.uid,updateInfo);
            Profile.updateAfterPurchase(newBalence);
            await FirebaseController.checkOut(cart);
            Util.info('Successful',`Check out complete, your current balence is now ${Util.currency(newBalence)}`);
            window.localStorage.removeItem(`cart-${Auth.currentUser.uid}`);
            cart.empty();
            Elements.shoppingCartCount.innerHTML = '0';
            history.pushState(null,null,Route.routePathnames.HOME);
            await Home.home_page();
           
       } catch (e) {
           if(Constant.DEV) console.log(e);
           Util.info('Checkout error',JSON.stringify(e))
       }
       Util.enableButton(checkout,label);
        
        
    });
}