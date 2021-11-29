import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import * as Detail from './details_product_page.js'
import * as Home from './home_page.js'

export function addEventListeners(){
    Elements.menuWishlist.addEventListener('click', async () => {
        const label = Util.disableButton(Elements.menuWishlist);
        history.pushState(null,null,Route.routePathnames.WISHLIST);
        //await Util.sleep(1000);
        await wishlist_page();
        Util.enableButton(Elements.menuWishlist,label);
    });
}


export async function wishlist_page(){
    let count = 0;
    let html = '<h1 style="text-align: center;">Wishlist</h1>';
    if (!Auth.currentUser) {
        Elements.root.innerHTML = '<h1>Protected Page</h1>';
        return;
    }
    const cart = Home.cart;

    let wishlist = [];
    const productList = [];
    try {
        wishlist = await FirebaseController.getWishlist(Auth.currentUser.uid);
        if(wishlist.length == 0){
            Elements.root.innerHTML = 
                `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                    <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </symbol>
                </svg>
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        Wishlist is Empty
                    </div>
                </div>`;
            return;
        }

       for(let i = 0; i < wishlist.length; i++){
        const p = await FirebaseController.getProductInfo(wishlist[i].productId);
        productList.push(p);
       }

    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('Sorry something happened',JSON.stringify(e));
    }


    



    html += `
        <table class="table table-dark table-striped table-bordered">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Price</th>
                    <th scope="col">Date Added</th>
                    <th scope="col">Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    for(let i = 0; i < productList.length; i++){
        html += `
            <tr>
                <td>${productList[i].name} <br> <img src="${productList[i].imageURL}" width="150px"></td>
                <td>${Util.currency(productList[i].price)}</td>
                <td>${new Date(wishlist[i].timestamp).toString()}</td>
                <td>
                    <form method="post" class="delete-item-wishlist" style="display: inline-block;">
                        <input type="hidden" name="index" value="${i}">
                        <button style="display: inline-block;" class="btn btn-outline-danger" type="submit"><i class="fas fa-trash-alt"></i></button>
                    </form>
                    <form method="post" class="add-item-wishlist" style="display: inline-block;">
                        <input type="hidden" name="index" value="${i}">
                        <button style="display: inline-block;" class="btn btn-outline-info" type="submit"><i class="fas fa-cart-plus"></i></button>
                    </form>
                    <form method="post" class="view-item-wishlist" style="display: inline-block;">
                        <input type="hidden" name="index" value="${i}">
                        <button style="display: inline-block;" class="btn btn-outline-info" type="submit"><i class="fas fa-eye"></i></button>
                    </form>
                </td>
            </tr>
        `;
    }


    html += '</tbody></table>';
    Elements.root.innerHTML = html;






    const deleteWishlistItemForms = document.getElementsByClassName('delete-item-wishlist');
    const addWishlistItemForms = document.getElementsByClassName('add-item-wishlist');
    const viewWishlistItemForms = document.getElementsByClassName('view-item-wishlist');



    for(let i = 0; i < deleteWishlistItemForms.length; i++){
        deleteWishlistItemForms[i].addEventListener('submit',async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            const index = e.target.index.value;
            const item = wishlist[index];
            try {
                await FirebaseController.deleteItemFromWishlist(item.docId);
                Util.info('Success!',`Item: ${productList[index].name} has been removed`);
                wishlist.splice(index,1);
                productList.splice(index,1);
            } catch (e) {
                if(Constant.DEV) console.log(e);
                Util.info('Sorry something happend',JSON.stringify(e));
            }
            
            Util.enableButton(button,label);
            await wishlist_page();
        });
    }



    for(let i = 0; i < viewWishlistItemForms.length; i++){
        viewWishlistItemForms[i].addEventListener('submit',async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            const index = e.target.index.value;
            //history.pushState(null,null,Route.routePathnames.DETAILS);
            await Detail.detailProductViewPage(wishlist[index].productId);
            Util.enableButton(button,label);

        });
    }
    
    

    for(let i = 0; i < addWishlistItemForms.length; i++){
        addWishlistItemForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const button = e.target.getElementsByTagName('button')[0];
            const label = Util.disableButton(button);
            const index = e.target.index.value;
            const product = productList[index];
            let item;
            for(let i = 0; i < wishlist.length; i++){
                if(wishlist[i].productId == product.docId){
                    item = wishlist[i];
                }
            }
            try {
                cart.addFromWishList(product,1);
                await FirebaseController.deleteItemFromWishlist(item.docId);
                Util.info('Success!', `${product.name} was added to your cart`);

            } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Something happened',JSON.stringify(e));
            }



            
            Elements.shoppingCartCount.innerHTML = cart.getTotalCount();
            Util.enableButton(button,label);
            await wishlist_page();
            

        });

    }

    

   
    


    



    


    
}