import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'


export function addEventListeners(){
    Elements.menuPurchases.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.PURCHASES);
        const label = Util.disableButton(Elements.menuPurchases);
        await purchases_page();
        Util.enableButton(Elements.menuPurchases,label);
    });
}


export async function purchases_page(){
    if (!Auth.currentUser) {
        Elements.root.innerHTML = '<h1>Protected Page</h1>';
        return;
    }
    let html = '<h1>Purchases Page</h1>';

    let cartHistory;
    try {
        cartHistory = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid);
        if(cartHistory.length == 0){
            html += `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                        <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </symbol>
                    </svg>
                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                        <div>
                            No Purchase History
                        </div>
                    </div>`;
        }
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('Purchase History error',JSON.stringify(e));
    }

    html += `
    <table class="table table-dark table-striped">
    <thead>
      <tr>
        <th scope="col">View</th>
        <th scope="col">Items</th>
        <th scope="col">Price</th>
        <th scope="col">Date of purchase</th>
      </tr>
    </thead>
    <tbody>
    `;

    for(let i = 0; i < cartHistory.length; i++){
        html += `
            <tr>
                <td>
                    <form method="post" class="form-purchase-history">
                        <input type="hidden" name="index" value="${i}">
                        <button type="submit" class="btn btn-outline-info">Details</button>
                    </form>
                </td>
                <td>${cartHistory[i].getTotalCount()}</td>
                <td>${Util.currency(cartHistory[i].getTotalPrice())}</td>
                <td>${new Date(cartHistory[i].timestamp).toString()}</td>
            </tr>
        `;
    }

    html += '</tbody></table>';
    Elements.root.innerHTML = html;

    const historyForms = document.getElementsByClassName('form-purchase-history');
    for(let i = 0; i < historyForms.length; i++){
        historyForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const index = e.target.index.value;
            Elements.purchaseHistoryDetailsTitle.innerHTML = `Purchased At: ${new Date(cartHistory[index].timestamp).toString()}`;
            Elements.purchaseHistoryDetailsBody.innerHTML = buildPurchaseHistoryDetails(cartHistory[index]);
            Elements.purchaseHistoryDetailsModal.show();
        });
    }
}


function buildPurchaseHistoryDetails(cart){
    let html = `
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


    return html;
}