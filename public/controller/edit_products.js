import * as FirebaseController from './firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Constant from '../model/constant.js'
import * as Element from '../viewpage/elements.js'
import { Product } from '../model/Products.js';

let imageFile2Upload;

export function addEventListeners(){
    Element.editProductForm.imageButton.addEventListener('change', e => {
        imageFile2Upload = e.target.files[0];
        if(!imageFile2Upload){
            Element.editProductForm.imageTag.src = null;
            Element.editProductForm.errorImage.innerHTML = 'No new image added. original image will be used'
            return;
        }
        Element.editProductForm.errorImage.innerHTML = '';
        const fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile2Upload);
        fileReader.onload = () => Element.editProductForm.imageTag.src = fileReader.result;
    });


    Element.editProductForm.form.addEventListener('submit', async e => {
        e.preventDefault();
        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);

        const p = new Product({
            name: e.target.name.value,
            price: e.target.price.value,
            summary: e.target.summary.value,
        });
        p.docId = e.target.docId.value;

        //error check
        const errors = p.validate(true); //bypass image check
        Element.editProductForm.errorName.innerHTML = errors.name ? errors.name : '';
        Element.editProductForm.errorPrice.innerHTML = errors.price ? errors.price : '';
        Element.editProductForm.errorSummary.innerHTML = errors.summary ? errors.summary : '';

        if(Object.keys(errors).length != 0){
            Util.enableButton(button,label);
            return;
        }

        try {
            if(imageFile2Upload){
                const imageInfo = await FirebaseController.uploadImage(imageFile2Upload,e.target.imageName.value);
                p.imageURL = imageInfo.imageURL;
            }


            //Update product in firestore
            await FirebaseController.updateProduct(p);
            //Update product on web browser
            const card = document.getElementById('card-'+p.docId);
            if(imageFile2Upload){
                card.getElementsByTagName('img')[0].src = p.imageURL;
            }

            card.getElementsByClassName('card-title')[0].innerHTML = p.name;
            card.getElementsByClassName('card-text')[0].innerHTML = `<b>Price: $${p.price}</b>`;
            card.getElementsByClassName('card-text')[1].innerHTML = `<b>Description: ${p.summary}</b>`;

            Util.info('Success!', `<b>${p.name}</b> has been updated!`,Element.modalEditProduct);



        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Update Product Error',JSON.stringify(e),Element.modalEditProduct);
        }

        Util.enableButton(button,label);
    });
}



export async function editProduct(docId){
    let product;
    try {
        product = await FirebaseController.getProductById(docId);
        if(!product){
            Util.info('getProductById error','Product does not exist');
            return;
        }
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('getProductById error',JSON.stringify(e));
    }



    //set edit form values 
    await resetFormErrorMessages();
    Element.editProductForm.form.docId.value = product.docId;
    Element.editProductForm.form.imageName.value = product.imageName;
    Element.editProductForm.form.name.value = product.name;
    Element.editProductForm.form.price.value = product.price;
    Element.editProductForm.form.summary.value = product.summary;
    Element.editProductForm.imageTag.src = product.imageURL;
    //show edit form to user
    Element.modalEditProduct.show();
}



async function resetFormErrorMessages(){
    imageFile2Upload = null;
    Element.editProductForm.imageButton = null;
    Element.editProductForm.errorImage.innerHTML ='';
    Element.editProductForm.errorName.innerHTML ='';
    Element.editProductForm.errorPrice.innerHTML ='';
    Element.editProductForm.errorSummary.innerHTML ='';
}


export async function delete_product(docId,imageName){
    
    try {
        await FirebaseController.deleteProduct(docId,imageName);
        const cardTag = document.getElementById('card-'+docId);
        cardTag.remove();
        Util.info('Deleted!', `${docId} has been removed`);
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info('Delete Product error', JSON.stringify(e));
    }

    
}