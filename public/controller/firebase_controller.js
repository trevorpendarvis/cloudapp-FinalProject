import { AccountInfo } from '../model/AccountInfo.js';
import * as Constant from '../model/constant.js'
import { Product } from '../model/Products.js';
import { Reply } from '../model/Reply.js';
import { ShoppingCart } from '../model/ShoppingCart.js';
import { Wishlist } from '../model/wishlist.js';
import * as Auth from './auth.js'

export let prev = [];
export let next = null;
export let org = null;
export let last = null;
export let temp = null;
export let page = null;
let currentList = [];

export async function signIn(email,password){
    await firebase.auth().signInWithEmailAndPassword(email,password);
}


export async function signOut(){
    await firebase.auth().signOut();
}



export async function getProductsList(action){
    const products = [];
    let snapShot;
    if(action == undefined){
        org = firebase.firestore().collection(Constant.collectionName.PRODUCT)
                .orderBy('name')
                .limit(8);
        snapShot = await org.get();
        if(!(await nextPageExists(snapShot.docs[snapShot.docs.length - 1]))){
            last = snapShot.docs[snapShot.docs.length - 1];
            next = firebase.firestore().collection(Constant.collectionName.PRODUCT)
                .orderBy('name')
                .startAfter(last)
                .limit(8);
        }else{
            next = null;
        }

        /*if(prev.length != 0){
            prev.length = 0;
            page = 0;
        }*/
        prev.length = 0;
        page = 0;
        
       
        
    }else if(action == 'next'){
       if(prev.length == 0){
           prev.push(org);
       }
        
        
        snapShot = await next.get();
        page+=1;
        if(!(await nextPageExists(snapShot.docs[snapShot.docs.length - 1]))){
            prev.push(next);
            last = snapShot.docs[snapShot.docs.length - 1];
            next = firebase.firestore().collection(Constant.collectionName.PRODUCT)
                .orderBy('name')
                .startAfter(last)
                .limit(8);
        }else{
            
            next =  null
        }

        
    }else if(action == 'prev'){
        temp = prev[page-1];
        snapShot = await temp.get();
        page -= 1;
        /*if(next != null && snapShot.docs[snapShot.docs.length - 1].id == last.id){
            temp = prev.pop();
            snapShot = await temp.get();
        }*/
        if(!(await nextPageExists(snapShot.docs[snapShot.docs.length - 1]))){
            last = snapShot.docs[snapShot.docs.length - 1];
            next = firebase.firestore().collection(Constant.collectionName.PRODUCT)
                .orderBy('name')
                .startAfter(last)
                .limit(8);
            
        }else{
            next = null;
        }
    }
                            
                            
    
            
    
    
    
            
    snapShot.docs.forEach(product => {
        const p = new Product(product.data());
        p.docId = product.id;
        products.push(p);
    });
       
            
        
    
    return products;
    
}

/*export async function getNextPage(){
    const products = [];
    const batch = firebase.firestore().collection(Constant.collectionName.PRODUCT)
            .orderBy('name')
            .startAfter(Constant.paginate.nextPage)
            .limit(8);


            const snapShot = await batch.get();
            
            
            if(Constant.paginate.prevPage.length > 1){
                Constant.paginate.prevPage.push(snapShot.docs[0]);
            }
            Constant.paginate.lastPage = await nextPageExists(snapShot.docs[snapShot.docs.length - 1]);
            Constant.paginate.nextPage = snapShot.docs[snapShot.docs.length-1];
            
            
            snapShot.docs.forEach(product => {
                const p = new Product(product.data());
                p.docId = product.id;
                products.push(p);
            });
            Constant.paginate.page += 1;
            Constant.paginate.firstPage = false;

    
    return products;
}


export async function getPrevPage(){
    const products = [];
    let prevPage = Constant.paginate.prevPage.pop();
    if(prevPage.id == Constant.paginate.nextPage.id){
        prevPage = Constant.paginate.prevPage.pop();
    }
    
   


    const batch = firebase.firestore().collection(Constant.collectionName.PRODUCT)
            .orderBy('name')
            .startAt(prevPage)
            .limit(8);


    const snapShot = await batch.get();
    Constant.paginate.nextPage = snapShot.docs[snapShot.docs.length - 1];
    snapShot.docs.forEach(product => {
        const p = new Product(product.data());
        p.docId = product.id;
        products.push(p);
    });
    Constant.paginate.page -= 1;
    if(Constant.paginate.prevPage.length == 0){
        Constant.paginate.prevPage.push(prevPage);
        Constant.paginate.firstPage = true;
    }
    Constant.paginate.lastPage = false;
    

    return products;
}*/


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
export async function getProductList(action){
    let productList = [];
    const results = await cf_getProductList(action); //results.data
    results.data.forEach(data => {
        const p = new Product(data);
        p.docId = data.docId;
        //next = data.next;
        //page = p.page;
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
        p.docId = docId;
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


export async function nextPageExists(nextPage){
    const batch = await firebase.firestore().collection(Constant.collectionName.PRODUCT)
            .orderBy('name')
            .startAfter(nextPage)
            .limit(8)
            .get();

    if(batch.empty){
        return true;
    }else{
        return false;
    }

}


export async function addItemToWishlist(wishlist){
    const ref = await firebase.firestore().collection(Constant.collectionName.WISHLIST)
                .add(wishlist);

    return ref.id;
}



export async function getWishlist(uid){
    let wishlist = [];
    const snapShot = await firebase.firestore().collection(Constant.collectionName.WISHLIST)
                .where('uid','==',uid)
                .orderBy('timestamp','desc')
                .get();

    if(snapShot.length < 1){
        return null;
    }


    snapShot.forEach(item => {
        const i = new Wishlist(item.data());
        i.docId = item.id;
        wishlist.push(i);
    });

    return wishlist;
}

export async function deleteItemFromWishlist(docId){
    await firebase.firestore().collection(Constant.collectionName.WISHLIST)
            .doc(docId)
            .delete();
}



export async function deleteProfile(uid){
    let snapShot = await firebase.firestore().collection(Constant.collectionName.REPLIES)
                        .where('uid','==',uid)
                        .get();
    snapShot.forEach(async doc => {
        await await firebase.firestore().collection(Constant.collectionName.REPLIES)
                    .doc(doc.id)
                    .delete();
    });

    snapShot = await firebase.firestore().collection(Constant.collectionName.WISHLIST)
    .where('uid','==',uid)
    .get();

    snapShot.forEach(async doc => {
        await await firebase.firestore().collection(Constant.collectionName.WISHLIST)
                    .doc(doc.id)
                    .delete();
    });

    snapShot = await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY)
        .where('uid', '==', uid)
        .get();

    snapShot.forEach(async doc => {
        await firebase.firestore().collection(Constant.collectionName.PURCHASE_HISTORY)
                .doc(doc.id)
                .delete();
    });


    snapShot = await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
            .doc(uid)
            .get();

    
    
    
    const account = new AccountInfo(snapShot.data());
    if(account.photoURL[0] == 'h'){
        await firebase.storage().ref()
        .child(Constant.storageFolderNames.PROFILE_PHOTOS + uid).delete();
    }

    await firebase.firestore().collection(Constant.collectionName.ACCOUNT_INFO)
            .doc(uid)
            .delete();
    
    
    //await signOut();
    await firebase.auth().currentUser.delete();
    
    
    
    
}

