import * as Element from "./elements.js";
import { Product } from "../model/Products.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Util from "./util.js";
import * as Constant from "../model/constant.js";
import * as Route from '../controller/routes.js'
import * as Edit from '../controller/edit_products.js'
import * as Auth from '../controller/auth.js'

export let imageFile = null;

export async function addEventListeners() {
  Element.menuProducts.addEventListener("click", async () => {
    history.pushState(null,null,Route.routePathnames.PRODUCTS);
    const button = Element.menuProducts;
    const label = Util.disableButton(button);
    await products_page();
    Util.enableButton(button,label);
  });

  Element.addProductForm.form.addEventListener("submit",async e => {
    e.preventDefault();
   const label =  Util.disableButton(document.getElementById('submit-form-button'));
   // await Util.sleep(1000);
    await addNewProduct(e.target);
    await products_page();
    Util.enableButton(document.getElementById('submit-form-button'),label);
  });

  Element.addProductForm.imageButton.addEventListener("change", (e) => {
    imageFile = e.target.files[0];
    if (!imageFile) {
      Element.addProductForm.imageTag.src = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      Element.addProductForm.imageTag.src = reader.result;
    };
    reader.readAsDataURL(imageFile);
  });
}

export async function products_page(action) {
  
  if(!Auth.isAdmin || !Auth.currentUser){
    Element.root.innerHTML = `<h1>Admins only<h1>`;
    return;
}
  
  
  
  let html = `
        <div>
            <button id="button-add-product" class="btn btn-outline-success">
                +Add Product
            </button>
        </div>
        <br>
    `;

  //retrieve products list
  let productsList;
  try {
    productsList = await FirebaseController.getProductsList(action);
  } catch (e) {
    if (Constant.DEV) console.log(e);
    Util.info("Error Products list", JSON.stringify(e));
    return;
  }

  //render productsList to the client.
  productsList.forEach((p) => {
   

    html += buildProductCard(p);
  });


  html += `
    <div style="text-align: center; margin: 100px 0 0 5%;">
        <form method="post" id="paginate-form">`;
            
                
            
    html += `<button ${FirebaseController.page == 0 ? 'disabled':''} class="btn btn-outline-dark" type="submit" onclick="this.form.submitter='prev'"><i class="fas fa-arrow-left"></i></button>`;
               
            
    html+= `<button disabled class="btn btn-outline-dark">${FirebaseController.page+1}</i></button>`;
            
    html+= `<button ${FirebaseController.next == null ? 'disabled ':' '} class="btn btn-outline-dark" type="submit" onclick="this.form.submitter='next'"><i class="fas fa-arrow-right"></i></button>`;
            

    html+= `</form></div>`;  
  
  Element.root.innerHTML = html;



  document.getElementById('paginate-form').addEventListener("submit", async e => {
    e.preventDefault();
    const buttons = document.getElementsByTagName('button');
    

    await products_page(e.target.submitter);

});



  document
    .getElementById("button-add-product")
    .addEventListener("click", () => {
        Element.addProductForm.form.reset();
        Element.addProductForm.imageTag.src = null;
        imageFile = null;
        Element.modalAddProduct.show();
    });


  const editForms = document.getElementsByClassName('form-edit-products');

  for(let i = 0; i < editForms.length; i++){
    editForms[i].addEventListener('submit', async e => {
      e.preventDefault();
      const button = e.target.getElementsByTagName('button')[0];
      const label = Util.disableButton(button);
      await Edit.editProduct(e.target.docId.value);
      Util.enableButton(button,label);
    });
  }

  const deleteProductForm = document.getElementsByClassName('form-delete-products');
  for(let i = 0; i < deleteProductForm.length; i++){
    deleteProductForm[i].addEventListener('submit',async e =>{
      e.preventDefault();
      if(!window.confirm('Press OK to delete')) return; // Cancel button pressed
      const button = e.target.getElementsByTagName('button')[0];
      const label = Util.disableButton(button);
      await Edit.delete_product(e.target.docId.value, e.target.imageName.value);
      Util.enableButton(button,label);
    });
  }
}

async function addNewProduct(form) {
  const name = form.name.value;
  const price = form.price.value;
  const summary = form.summary.value;

  let product = new Product({ name, price, summary });

  const errors = product.validate(imageFile);

  Element.addProductForm.errorName.innerHTML = errors.name ? errors.name : "";
  Element.addProductForm.errorPrice.innerHTML = errors.price
    ? errors.price
    : "";
  Element.addProductForm.errorSummary.innerHTML = errors.summary
    ? errors.summary
    : "";
  Element.addProductForm.errorImage.innerHTML = errors.imageFile
    ? errors.imageFile
    : "";

  if (Object.keys(errors).length != 0) return; //errors exist

  //Save product into firebase
  //1. Save image into cloud storage and retrieve image name and image URL.
  try {
    const { imageURL, imageName } = await FirebaseController.uploadImage(
      imageFile
    );
    product.imageName = imageName;
    product.imageURL = imageURL;
    //2. add imageName and imageURL to product object and save it into firestore.
    await FirebaseController.addProduct(product.serialize());
    Util.info("Success!", `${product.name} added`, Element.modalAddProduct);
  } catch (e) {
    if (Constant.DEV) console.log(e);
    Util.info("Upload Error", JSON.stringify(e), Element.modalAddProduct);
  }
}

function buildProductCard(product) {
  return `
    <div id="card-${product.docId}" class="card mb-3 col-6" style="display: inline-block; max-width: 18rem; margin-right: 15px; border-radius: 10px;" >
    
    <img src="${product.imageURL}" class="card-img-top" style="width:100%; height: 15vw; object-fit: contain; border-radius: 10px;">
    
    <hr style="border-top:  solid #000000; width:100%; border-radius: 5px; rounded">
    <div class="card-body">
      <h5 class="card-title">Name: ${product.name}</h5>
      <hr style="border-top: 3px solid #000000; width:100%;">
      <p class="card-text"><b>Price: $${product.price}</b></p>
      <hr style="border-top: 3px solid #000000; width:100%;">
      <p class="card-text"><b>Description: ${product.summary}</b></p>
    </div>
    <hr style="border-top:  solid #000000; width:100%; border-radius: 5px; rounded">
    <form class="form-edit-products float-start" method="post">
      <input type="hidden" name="docId" value="${product.docId}">
      <button type="submit" class="btn btn-outline-dark" style="border-radius: 12px;">Edit</button>
    </form>
    <form class="form-delete-products float-end" method="post">
      <input type="hidden" name="docId" value="${product.docId}">
      <input type="hidden" name="imageName" value="${product.imageName}">
      <button type="submit" class="btn btn-outline-danger" style="border-radius: 12px;">Delete</button>
    </form>
  </div>
    `;
}
