import { AccountInfo } from '../model/AccountInfo.js';
import * as Constant from '../model/constant.js'
import { Product } from '../model/Products.js';
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