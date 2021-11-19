import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import { ShoppingCart } from '../model/ShoppingCart.js'
import * as DetailView from './details_product_page.js'



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





export async function home_page(action){

    

    let html = `<div style="text-align: center;"><h1>Enjoy Shopping</h1></div>`;
    let products;
        try {
        
            products = await FirebaseController.getProductsList(action);
        
        
        if(cart){
            cart.items.forEach(item => {
                const product = products.find(p => item.docId == p.docId);
                if(products.includes(product)){
                    product.qty = item.qty; 
                }
            });
        }
        
        
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Products loading error',JSON.stringify(e));
        }
    
        
    

    for(let i = 0; i < products.length; i++){
        html += buildProductCard(products[i],i);
    }

    html += `
    <div style="text-align: center; margin: 100px 0 0 5%;">
        <form method="post" id="paginate-form">`;
            
                
            
    html += `<button ${FirebaseController.page == 0 ? 'disabled':''} class="btn btn-outline-dark" type="submit" onclick="this.form.submitter='prev'"><i class="fas fa-arrow-left"></i></button>`;
               
            
    html+= `<button disabled class="btn btn-outline-dark">${FirebaseController.page+1}</i></button>`;
            
    html+= `<button ${FirebaseController.next == null ? 'disabled ':' '} class="btn btn-outline-dark" type="submit" onclick="this.form.submitter='next'"><i class="fas fa-arrow-right"></i></button>`;
            

    html+= `</form></div>`;  
        
    
     
        
    Elements.root.innerHTML = html;



    



    document.getElementById('paginate-form').addEventListener("submit", async e => {
        e.preventDefault();
        const buttons = document.getElementsByTagName('button');
        

        await home_page(e.target.submitter);

    });

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

    

    const viewDeatailsForms = document.getElementsByClassName('form-view-product-details');
    for(let i = 0; i < viewDeatailsForms.length; i++){
        viewDeatailsForms[i].addEventListener('submit',async e => {
            e.preventDefault();
            const docId = e.target.docId.value;
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
           await DetailView.detailProductViewPage(docId);
           Util.enableButton(button,label);   
        });
    }


}




function buildProductCard(product,index) {
    return `
        
      <div id="card-${product.docId}" class="card" style="display: inline-block; max-width: 18rem; margin-right: 15px; border-radius: 10px;" >
      
      <img src="${product.imageURL}" class="card-img-top" style="width:100%; height: 15vw; object-fit: contain; border-radius: 10px;">
      
      <hr style="border-top:  solid #374045; border-radius: 5px; rounded">
      <div class="card-body">
        <h5 class="card-title">Name: ${product.name}</h5>
        <hr style="border-top: 3px solid #374045;">
        <p class="card-text"><b>Price: ${Util.currency(product.price)}</b></p>
        <hr style="border-top: 3px solid #374045;">
        <p class="card-text"><b>Description: ${product.summary}</b></p>
        <hr style="border-top: 3px solid #374045;">
        <div class="container pt-3 bg-light ${Auth.currentUser && !Constant.adminEmails.includes(Auth.currentUser.email)  ? 'd-block' : 'd-none'}" style="text-align: center;">
            <form method="post" class="form-view-product-details">
                <input type="hidden" name="docId" value="${product.docId}">
                <button type="submit" class="btn btn-outline-primary">View details</button>
            </form>
            <hr style="border-top: 3px solid #374045;">
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


  