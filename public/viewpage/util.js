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



export function disableButton(button){
    button.disable = true;
    const label = button.innerHTML;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;
    return label;
}

export function enableButton(button,label){
    if(label) button.innerHTML = label;
    button.disable = false;
}


export async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}