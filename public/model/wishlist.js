export class Wishlist{
    constructor(data){
        this.productId = data.productId;
        this.uid = data.uid,
        this.timestamp = data.timestamp;

    }


    serialize(timestamp){
        return {
            productId:this.productId,
            uid:this.uid,
            timestamp,
        };
    }
}