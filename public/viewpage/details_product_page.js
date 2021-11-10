import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import { Reply } from '../model/Reply.js'
import * as Edit from '../controller/edit_reviews.js';


export async function detailProductViewPage(docId){
    if(!docId) return;
    history.pushState(null,null,Route.routePathnames.DETAILS + '#' + docId);
    await detailProductPage(docId)
}


export async function detailProductPage(docId){
    if(!Auth.currentUser){
        Elements.root.innerHTML = `<h1 style="margin-bottom: 10px;">Protected Page</h1>`;
    }

    if(!docId){
        Util.info('Error','Document ID not found');
        return;
    }

    let html = `<div style="text-align: center;"><h1 style="margin-bottom: 15px;">Details</h1>`;

    let replyList = [];
    let productDetail;
    try {
        productDetail = await FirebaseController.getProductInfo(docId);
        replyList = await FirebaseController.getRepliesList(docId);
    } catch (e) {
        if(Constant.DEV) console.log(e)
        Util.info('Error could not retrieve info of product',JSON.stringify(e));
        return;
    }

    html += `
    <table class="table table-dark table-striped table-hover">
    <thead></thead>
    <tbody>
        <tr>
            <td>
                <h2><b>${productDetail.name}</b></h2>
            </td>
        </tr>
        <tr>
            <td>
            <img src="${productDetail.imageURL}" width="350px">
            </td>
        </tr>
        
    `;

        

            if(replyList.length > 0){
            replyList.forEach(r => {
                html += buildCard(r);
            });
        }else{
            html += `
            <tr>
            <td> 
             <div class="card text-center border border-primary" style="background-color: #393E46;">
                 <div class="card-header text-white bg-info">
                 </div>
                 <div class="card-body">
                     <h3><b>No Reviews</b></h3>
                 </div>
             </div>
             </td>
             </tr>
         
         `;
        }
        html += '</tbody></table>';


    


     let cartHistory;
     let hasPurchased = false;
     try {
         cartHistory = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid);
        
        
        for(let i = 0; i < cartHistory.length; i++){
            if(cartHistory[i].hasPurchased(docId)){
                hasPurchased = true;
                break;
            }
        }
            
        

        
     } catch (e) {
         if(Constant.DEV) console.log(e);
         Util.info('Error could not retrieve cart history',JSON.stringify(e));
         return;
     }


        html += `
                    <div class="${hasPurchased ? 'd-block' : 'd-none'}">
                            <form method="post" id="post-reply-form">
                                <input type="hidden" name="docId" value="${docId}">
                                <div style="text-align: center;"><textarea id="textarea-add-reply" placeholder="Add a review" rows="5" style="width: 100%;"></textarea></div>
                                <div style="text-align: center;">
                                <button type="submit" class="btn btn-outline-info">Commit</button>
                                </div>
                            </form>
                    </div>
            `;

     Elements.root.innerHTML = html;


     const editReviewForms = document.getElementsByClassName('edit-review-form');
     for(let i = 0; i < editReviewForms.length; i++){
         editReviewForms[i].addEventListener('submit', async e => {
             e.preventDefault();
             await Edit.editReview(e.target.docId.value);
         });
     }

     const deleteReviewForms = document.getElementsByClassName('delete-review-form');
     for(let i = 0; i < deleteReviewForms.length; i++){
        deleteReviewForms[i].addEventListener('submit', async e => {
            e.preventDefault();
            await Edit.deleteReview(e.target.docId.value);
        });
     }
     



     document.getElementById('post-reply-form').addEventListener('submit',async e=> {
         e.preventDefault();
         const productId = e.target.docId.value;
         const content = document.getElementById('textarea-add-reply').value;
         const timestamp = Date.now();
         const uid = Auth.currentUser.uid;
         const email = Auth.currentUser.email;
         const reply = new Reply(
            {productId,uid,email,timestamp,content}
        );
        try {
           const replyId = await FirebaseController.addReply(reply.serialize());
           reply.docId = replyId;
           replyList.push(reply);
           Util.info('Success!','Review uploaded');
           document.getElementById('textarea-add-reply').value = '';
           detailProductPage(docId);
           
           

            
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Error could not post review',JSON.stringify(e));
        }








     });





}






function buildCard(reply){
    return `
       <tr id="entry-${reply.docId}">
       <td> 
        <div class="card text-center border border-primary" style="background-color: #393E46;">
            <div class="card-header text-white bg-info">
                <h4>${reply.email}</h4>
            </div>
            <div class="card-body">
                <h3 id="content-${reply.docId}"><b>${reply.content}</b></h3>
            </div>
            <div class="${reply.uid == Auth.currentUser.uid ? 'd-block' : 'd-none'}">
                <form method="post" class="edit-review-form d-inline">
                <input type="hidden" name="docId" value="${reply.docId}">
                <button class="btn btn-outline-info d-inline">Edit Reply</button>
                </form>
                <form method="post" class="delete-review-form d-inline">
                <input type="hidden" name="docId" value="${reply.docId}">
                <button class="btn btn-outline-info d-inline">Delete Reply</button>
                </form>
            </div>
            <div class="card-footer text-muted" id="timeStamp-${reply.docId}">
                ${new Date(reply.timestamp).toString()}
            </div>
        </div>
        </td>
        </tr>
    
    `;
}


