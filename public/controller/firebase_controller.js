import { AccountInfo } from '../model/AccountInfo.js';
import * as Constant from '../model/constant.js'
import { Product } from '../model/Products.js';
import { Reply } from '../model/Reply.js';
import { ShoppingCart } from '../model/ShoppingCart.js';

export async function signIn(email,password){
    await firebase.auth().signInWithEmailAndPassword(email,password);
}


export async function signOut(){
    await firebase.auth().signOut();
}



export async function getProductsList(){
    const products = [];
    const snapShot = await firebase.firestore()
                    .collection(Constant.collectionName.PRODUCT)
                    .orderBy('name')
                    .get();
    snapShot.forEach(doc => {
        const p = new Product(doc.data());
        p.docId = doc.id;
        products.push(p);
    });
    return products;
}


export async function checkOut(cart){
    const data = cart.serialize(Date.now());
    await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY)
                            .add(data);
}


export async function getPurchaseHistory(uid){
    const snapShot = await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY)
                    .where('uid', '==', uid)
                    .orderBy('timestamp','desc')
                    .get();
    const cartHistory = [];
    snapShot.forEach(doc => {
        const sc = ShoppingCart.deserialize(doc.data());
        cartHistory.push(sc);
    });
    return cartHistory;
}

export async function createUser(email, password){
    await firebase.auth().createUserWithEmailAndPassword(email,password);
}


export async function getAccountInfo(uid){
    const doc = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
                        .doc(uid).get();

    if(doc.exists){
        return new AccountInfo(doc.data());
    }else{
        const defaultAccount = AccountInfo.instance();
        await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
                        .doc(uid).set(defaultAccount.serialize());
        return defaultAccount;
    }
}


export async function updateAccount(uid, updateInfo){
    //updateInfo = {key: value}

    await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
        .doc(uid).update(updateInfo);
}

export async function uploadProfilePhoto(photoFile,imageName){
    const ref = firebase.storage().ref()
            .child(Constant.storageFolderNames.PROFILE_PHOTOS + imageName);

    const taskSnapShot = await ref.put(photoFile);
    const photoURL = await taskSnapShot.ref.getDownloadURL();
    return photoURL;
            
}


const cf_addProducts = firebase.functions().httpsCallable('cf_addProducts');
export async function addProduct(product){
    await cf_addProducts(product);
}

export async function uploadImage(imageFile,imageName){
    if(!imageName)
    imageName = Date.now() + imageFile.name;

    const ref = firebase.storage().ref()
                .child(Constant.storageFolderNames.PRODUCT_IMAGES + imageName);

    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();

    return {imageURL,imageName};
}


const cf_getProductList = firebase.functions().httpsCallable('cf_getProductList');
export async function getProductList(){
    let productList = [];
    const results = await cf_getProductList(); //results.data
    results.data.forEach(data => {
        const p = new Product(data);
        p.docId = data.docId;
        productList.push(p);
    });
    return productList;
}


const cf_getProductById = firebase.functions().httpsCallable('cf_getProductById');
export async function getProductById(docId){
    const results = await cf_getProductById(docId);

    if(results.data){
        const product = new Product(results.data);
        product.docId = results.data.docId;
        return product;
    }else{
        return null;
    }
}

const cf_updateProduct = firebase.functions().httpsCallable('cf_updateProduct');
export async function updateProduct(product){
    const docId = product.docId;
    const data = product.serializeForUpdate();
    await cf_updateProduct({docId,data});
}

const cf_deleteProduct = firebase.functions().httpsCallable('cf_deleteProduct');
export async function deleteProduct(docId,imageName){
    await cf_deleteProduct(docId);

    //getting reference to the image
    const ref = firebase.storage().ref()
                .child(Constant.storageFolderNames.PRODUCT_IMAGES+imageName);

    // removing image
    await ref.delete();
}

const cf_getUsersList = firebase.functions().httpsCallable('cf_getUsersList');
export async function getUsersList(){
    const results = await cf_getUsersList();
    return results.data;
}


const cf_updateUser = firebase.functions().httpsCallable('cf_updateUser');
export async function updateUser(uid,update){
    await cf_updateUser({uid,update});
}

const cf_deleteUser = firebase.functions().httpsCallable('cf_deleteUser');
export async function deleteUser(uid){
    await cf_deleteUser(uid);
}



export async function getProductInfo(docId){
    const result = await firebase.firestore().collection(Constant.collectionName.PRODUCT)
                    .doc(docId)
                    .get();
    if(result){
        const p = new Product(result.data());
        p.docId = result.data.docId;
        return p;
    }else{
        return null;
    }
     
}


export async function addReply(reply){
   const ref =  await firebase.firestore().collection(Constant.collectionName.REPLIES)
                    .add(reply);

    return ref.id;
}


export async function getRepliesList(docId){
    const snapShot = await firebase.firestore().collection(Constant.collectionName.REPLIES)
                    .where('productId','==',docId)
                    .orderBy('timestamp','desc')
                    .get();

        let replyList = [];
        snapShot.forEach(r => {
            const reply = new Reply(r.data());
            reply.docId = r.id;
            replyList.push(reply);
        });

        return replyList;
    
}



export async function getReviewById(docId){
    const doc = await firebase.firestore().collection(Constant.collectionName.REPLIES)
                        .doc(docId)
                        .get();
        if(doc){
            const reply = new Reply(doc.data());
            reply.docId = doc.id;
            return reply;
        }else{
            return null;
        }
}


export async function updateReview(reply){
    await firebase.firestore().collection(Constant.collectionName.REPLIES)
                    .doc(reply.docId)
                    .update(reply);
    
}

export async function deleteReview(docId){
    await firebase.firestore().collection(Constant.collectionName.REPLIES).doc(docId).delete();
}