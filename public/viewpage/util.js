import * as Elements from './elements.js'

export function info(title,body,closeModal){
    if(closeModal) closeModal.hide();

    Elements.infoTitle.innerHTML = title;
    Elements.infoBody.innerHTML = body;
    Elements.infoModal.show();
}



export function currency(money){
    return new Intl.NumberFormat('en-US',{style: 'currency', currency: 'USD'}).format(money);
}