import { Product } from "./Products.js";

export class ShoppingCart{
    constructor(uid){
        this.uid = uid
        this.items = []; // array of serialized products
    }



    serialize(timestamp){
        return {uid: this.uid, items: this.items, timestamp};
    }

    static deserialize(data){
        const sc = new ShoppingCart(data.uid);
        sc.items = data.items;
        sc.timestamp = data.timestamp;
        return sc;
    }

    addItem(product){
        const item = this.items.find(e => product.docId == e.docId);

        if(!item){
            // new item 
            product.qty = 1;
            const newItem = product.serialize();
            newItem.docId = product.docId;
            this.items.push(newItem);
        }else{
            //item already exists
            ++product.qty;
            ++item.qty;
        }

        this.saveToLocalStorage();
    }

    addFromWishList(product,qty){
        product.qty = qty;
        const newItem = product.serialize();
        newItem.docId = product.docId;
        this.items.push(newItem);
        product.qty = 0;
        this.saveToLocalStorage();
    }

    removeItem(product){
        //dec qty or remove if qty == 0
        const index = this.items.findIndex(e => product.docId == e.docId);
        if(index < 0) return; //item not found

        --product.qty;
        --this.items[index].qty;

        if(product.qty == 0){
            this.items.splice(index,1);
        }

        this.saveToLocalStorage();
    }

    getTotalCount(){
        let n = 0;
        this.items.forEach(item => {
            n += item.qty;
        });
        return n;
    }

    getTotalPrice(){
        let total = 0;
        this.items.forEach(item => {
            total += (item.qty * item.price);
        });

        return total;
    }

    saveToLocalStorage(){
        window.localStorage.setItem(`cart-${this.uid}`,this.stringify());
    }

    static parse(cartString){
        try{
            if(!cartString) return null;
            const obj = JSON.parse(cartString);
            const sc = new ShoppingCart(obj.uid);
            sc.items = obj.items;
            return sc;
        }catch(e){
            return null;
        }
    }

    isValid(){
        if(!this.uid) return false;
        if(!this.items || !Array.isArray(this.items)) return false;
        for(let i = 0; i < this.items.length; i++){
            if(!Product.isSerializedProduct(this.items[i])) return false;
        }

        return true;
    }


    stringify(){
        return JSON.stringify({uid:this.uid,items:this.items});
    }

    empty(){
        this.items.length = 0;
    }


    hasPurchased(docId){
        let purchased = false;
        this.items.forEach(product => {
            if(product.docId == docId){
                purchased = true;
            }
        });

        return purchased;
    }
}