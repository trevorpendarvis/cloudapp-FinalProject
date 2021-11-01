import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import { ShoppingCart } from '../model/ShoppingCart.js'



export function addEventListeners(){
    Elements.menuHome.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.HOME);
        const label = Util.disableButton(Elements.menuHome);
       // await Util.sleep(500);
        await home_page();
        Util.enableButton(Elements.menuHome,label);
    });
}

export let cart;




export async function home_page(){

    

    let html = `<div text-align: center;><h1>Enjoy Shopping</h1></div>`;

    let products;
    try {
        products = await FirebaseController.getProductsList();

        if(cart){
            cart.items.forEach(item => {
                const product = products.find(p => item.docId == p.docId);
                product.qty = item.qty; 
            });
        }
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('Products loading error',JSON.stringify(e));
    }

    for(let i = 0; i < products.length; i++){
        html += buildProductCard(products[i],i);
    }

    Elements.root.innerHTML = html;

    const formDec = document.getElementsByClassName('form-dec-qty');
    for(let i = 0; i < formDec.length; i++){
        formDec[i].addEventListener('submit', async e => {
            e.preventDefault();
            const p = products[e.target.index.value];
            // dec p from shopping cart
            cart.removeItem(p);
            document.getElementById('qty-'+p.docId).innerHTML =
            (p.qty == null || p.qty == 0) ? 'Add' : p.qty;
            Elements.shoppingCartCount.innerHTML = cart.getTotalCount();
        });
    }
    const formInc = document.getElementsByClassName('form-inc-qty');
    for(let i = 0; i < formDec.length; i++){
        formInc[i].addEventListener('submit', async e => {
            e.preventDefault();
            const p = products[e.target.index.value];
            // inc p from shopping cart
            cart.addItem(p);
            document.getElementById('qty-'+p.docId).innerHTML = p.qty;
            Elements.shoppingCartCount.innerHTML = cart.getTotalCount();
        });
    }
}




function buildProductCard(product,index) {
    return `
      <div id="card-${product.docId}" class="card" style="display: inline-block; max-width: 18rem; margin-right: 15px; border-radius: 10px;" >
      
      <img src="${product.imageURL}" class="card-img-top" style="width:100%; height: 15vw; object-fit: contain; border-radius: 10px;">
      
      <hr style="border-top:  solid #AAA; border-radius: 5px; rounded">
      <div class="card-body">
        <h5 class="card-title">Name: ${product.name}</h5>
        <hr style="border-top: 3px solid #AAA;">
        <p class="card-text"><b>Price: ${Util.currency(product.price)}</b></p>
        <hr style="border-top: 3px solid #AAA;">
        <p class="card-text"><b>Description: ${product.summary}</b></p>
        <div class="container pt-3 bg-light ${Auth.currentUser && !Constant.adminEmails.includes(Auth.currentUser.email)  ? 'd-block' : 'd-none'}">
            <form method="post" class="d-inline form-dec-qty">
                <input type="hidden" name="index" value="${index}">
                <button class="btn btn-outline-danger" type="submit">&minus;</button>
            </form>
            <div id="qty-${product.docId}" class="container rounded text-center text-white bg-info d-inline-block w-50">
                ${product.qty == null || product.qty == 0 ? 'Add' : product.qty}
            </div>
            <form method="post" class="d-inline form-inc-qty">
                <input type="hidden" name="index" value="${index}">
                <button class="btn btn-outline-success" type="submit">&plus;</button>
            </form>
        </div>
      </div>
    </div>
      `;
  }


  export function initShoppingCart(){
    const cartString = window.localStorage.getItem('cart-' + Auth.currentUser.uid);
    cart = ShoppingCart.parse(cartString);
    if(!cart || !cart.isValid() || cart.uid != Auth.currentUser.uid){
        window.localStorage.removeItem('cart-' + Auth.currentUser.uid);
        cart = new ShoppingCart(Auth.currentUser.uid);
    }

    Elements.shoppingCartCount.innerHTML = cart.getTotalCount();
      
  }