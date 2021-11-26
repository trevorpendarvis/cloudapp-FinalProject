const functions = require("firebase-functions");



const admin = require("firebase-admin");

const serviceAccount = require("./account_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const Constants = require('./constants');
const { firestore } = require("firebase-admin");


function isAdmin(email){
  return Constants.adminEmails.includes(email);
}



exports.cf_addProducts = functions.https.onCall(addProduct);
exports.cf_getProductList = functions.https.onCall(getProductList);
exports.cf_getProductById = functions.https.onCall(getProductById);
exports.cf_updateProduct = functions.https.onCall(updateProduct);
exports.cf_deleteProduct = functions.https.onCall(deleteProduct);
exports.cf_getUsersList = functions.https.onCall(getUsersList);
exports.cf_updateUser = functions.https.onCall(updateUser);
exports.cf_deleteUser = functions.https.onCall(deleteUser);
exports.cf_getOrders = functions.https.onCall(getOrders);
exports.cf_getCompletedOrders = functions.https.onCall(getCompletedOrders);
exports.cf_updateOrder = functions.https.onCall(updateOrder);
exports.cf_deleteOrder = functions.https.onCall(deleteOrder);  




async function deleteUser(data,context){
  //data ==> uid
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

  try {
    await admin.auth().deleteUser(data);
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Delete User failed. \n System response: ${JSON.stringify(e)}`);
  }
}



async function updateUser(data,context){
  //data == {uid,update} ===> update: {key: value}
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }


  try {
    const uid = data.uid;
    const update = data.update;
    await admin.auth().updateUser(uid,update);
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Update User failed. \n System response: ${JSON.stringify(e)}`);
  }
}








async function getUsersList(data,context){
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

 const userList = [];
 const MAX_RESULTS = 2;


  try {
    let results = await admin.auth().listUsers(MAX_RESULTS);
    userList.push(...results.users); //spread operator
    let nextPageToken = results.pageToken;
    while(nextPageToken){
      results = await admin.auth().listUsers(MAX_RESULTS,nextPageToken);
      userList.push(...results.users);
      nextPageToken = results.pageToken;
    }
    return userList;
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Get Users failed. \n System response: ${JSON.stringify(e)}`);
  }
}


async function deleteProduct(docId,context){
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

  try {
    await admin.firestore().collection(Constants.collectionNames.PRODUCTS)
            .doc(docId)
            .delete();
    
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Delete product failed. \n System response: ${JSON.stringify(e)}`);
  }
}

async function deleteOrder(docId,context){
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

  try {
    await admin.firestore().collection(Constants.collectionNames.ORDERS).doc(docId).delete();
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Delete Order failed. \n System response: ${JSON.stringify(e)}`);
  }
}




async function updateProduct(productInfo,context){
  // productInfo = {docId,data}

  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('internal','Only admins may invoke this operation');
    }
  }

  try {
    await admin.firestore().collection(Constants.collectionNames.PRODUCTS)
          .doc(productInfo.docId)
          .update(productInfo.data);
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Update product failed. \n System response: ${JSON.stringify(e)}`);
  }

}

async function updateOrder(orderInfo,context){
  //orderInfo == {docId,data}
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }


  try {
    await admin.firestore().collection(Constants.collectionNames.ORDERS)
                  .doc(orderInfo.docId)
                  .update(orderInfo.data)
    
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`Update order failed. \n System response: ${JSON.stringify(e)}`);
  }
}




async function addProduct(data,context){
  //data: serialize product object

  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }


  try {
    await admin.firestore().collection(Constants.collectionNames.PRODUCTS)
              .add(data);
    
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`add product failed. \n System response: ${JSON.stringify(e)}`);
  }
}

//data == Document(product) ID
async function getProductById(data,context){
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

  try {
    const doc = await firestore().collection(Constants.collectionNames.PRODUCTS)
                      .doc(data)
                      .get();
    if(!doc.exists) return null;

    const {name, price, summary, imageName, imageURL} = doc.data();
    const p = {name, price, summary, imageName, imageURL};
    p.docId = doc.id;
    return p;
  } catch (e) {
    if(Constants.DEV) console.log(e)
    throw new functions.https.HttpsError('internal',`getProductsByID failed. \n System response: ${JSON.stringify(e)}`);
  }

}




async function getOrders(data,context){
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

  let orderList = [];
  try {
    
    const snapShot = await admin.firestore()
                .collection(Constants.collectionNames.ORDERS)
                .where('status','==',true)
                .get();
      snapShot.forEach(doc => {
        const {orderBy,product,status,timeStamp} = doc.data();
        const o = {orderBy,product,status,timeStamp};
        o.docId = doc.id;
        orderList.push(o);
      });

      return orderList;
    
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`get Order List failed. \n System response: ${JSON.stringify(e)}`);
    
  }

  
}


async function getCompletedOrders(data,context){
  if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }
  let completedOrderList = [];
  try {
    const snapShot = await admin.firestore().collection(Constants.collectionNames.ORDERS)
                        .where('status','==',false)
                        .get();
    snapShot.forEach(order => {
      const {orderBy,product,status,timeStamp} = order.data();
      const o = {orderBy,product,status,timeStamp};
      o.docId = order.id;
      completedOrderList.push(o);
    });

    return completedOrderList;
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`get Completed Order List failed. \n System response: ${JSON.stringify(e)}`);
  }

 
}





async function getProductList(action,context){
 /* if(!isAdmin(context.auth.token.email)){
    if(Constants.DEV){
      console.log('Admin access only',context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated','Only admins may invoke this operation');
    }
  }

  try {
    let productList = [];
    const snapShot = await admin.firestore()
                .collection(Constants.collectionNames.PRODUCTS)
                .orderBy('name')
                .get();

                const productList = [];
                let snapShot;
                if(action == undefined){
                    org = admin.firestore().collection(Constants.collectionNames.PRODUCTS)
                            .orderBy('name')
                            .limit(8);
                    snapShot = await org.get();
                    if(!(await nextPageExists(snapShot.docs[snapShot.docs.length - 1]))){
                        last = snapShot.docs[snapShot.docs.length - 1];
                        next = admin.firestore().collection(Constants.collectionNames.PRODUCTS)
                            .orderBy('name')
                            .startAfter(last)
                            .limit(8);
                    }else{
                        next = null;
                    }
            
                    if(prev.length != 0){
                        prev.length = 0;
                        page = 0;
                    }
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
                        next = firebase.firestore().collection(Constants.collectionNames.PRODUCTS)
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
                    }
                    if(!(await nextPageExists(snapShot.docs[snapShot.docs.length - 1]))){
                        last = snapShot.docs[snapShot.docs.length - 1];
                        next = admin.firestore().collection(Constants.collectionNames.PRODUCTS)
                            .orderBy('name')
                            .startAfter(last)
                            .limit(8);
                        
                    }else{
                        next = null;
                        nextIsNull = true;
                    }
                }







    
    snapShot.forEach(doc => {
      const {name, price, summary, imageName, imageURL} = doc.data();
      const p = {name, price, summary, imageName, imageURL};
      p.docId = doc.id;
      productList.push(p);
    });

    
      
    
    return productList;
    
  } catch (e) {
    if(Constants.DEV) console.log(e);
    throw new functions.https.HttpsError('internal',`get productsList failed. \n System response: ${JSON.stringify(e)}`);
  }*/
}

async function nextPageExists(nextPage){
  const batch = await admin.firestore().collection(Constants.collectionNames.PRODUCTS)
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
