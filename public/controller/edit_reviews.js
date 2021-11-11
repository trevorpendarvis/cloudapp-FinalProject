import * as FirebaseController from './firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Constant from '../model/constant.js'
import * as Element from '../viewpage/elements.js'


export function addEventListeners(){
    Element.editReviewForm.addEventListener('submit',async e => {
        e.preventDefault();
        const r = {
            docId: e.target.docId.value,
            content: e.target.content.value,
            timestamp:Date.now(),
        };


        try {
            await FirebaseController.updateReview(r);
            document.getElementById(`content-${r.docId}`).innerHTML = r.content;
            document.getElementById(`timeStamp-${r.docId}`).innerHTML = new Date(r.timestamp).toString();
            Util.info("Success!","Review Message has been updated",Element.modalEditReview);
            
        } catch (e) {
            if(Constant.DEV) console.log(e)
            Util.info('Update Error',JSON.stringify(e),Element.modalEditReview);
        }



    });
}








export async function editReview(docId){
    let reply;
    try {
        reply = await FirebaseController.getReviewById(docId);
        if(!reply){
            Util.info('getReviewById error','message does not exist');
            return;
        }
        
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('getReviewById error',JSON.stringify(e));
    }



    Element.editReviewForm.reset();
    Element.editReviewForm.docId.value = reply.docId;
    Element.editReviewForm.content.value = reply.content;
    Element.modalEditReview.show();







}




export async function deleteReview(docId){
    if(!window.confirm('Are you sure you want to delete this review?')) return;
    try {
        await FirebaseController.deleteReview(docId);
        document.getElementById(`entry-${docId}`).remove();
        Util.info("Success!","Review Message has been deleted");
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('getReviewById error',JSON.stringify(e));
    }
}