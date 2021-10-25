export class AccountInfo{
    constructor(data){
        this.name = data.name;
        this.address = data.address;
        this.state = data.state;
        this.city = data.city;
        this.zip = data.zip;
        this.creditNo = data.creditNo;
        this.currentBalence = typeof data.currentBalence == 'number' ?  data.currentBalence : Number(data.currentBalence);
        this.photoURL = data.photoURL;
    }

    serialize(){
        return {
            name: this.name,
            address: this.address,
            state: this.state,
            city: this.city,
            zip: this.zip,
            creditNo: this.creditNo,
            currentBalence:this.currentBalence,
            photoURL: this.photoURL,
        };
    }


    static instance(){
        return new AccountInfo({
            name:'',  address:'', state:'',
            city:'',zip:'', creditNo:'',currentBalence:0.00,
            photoURL:'../assets/images/blank_profile.png',
        });
    }
}