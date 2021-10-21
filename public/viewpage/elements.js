//ROOT Element
export const root = document.getElementById('root');
//top menu items
export const menuSignIn = document.getElementById('menu-signIn');
export const menuHome = document.getElementById('menu-home');
export const menuPurchases = document.getElementById('menu-purchases');
export const menuSignOut = document.getElementById('menu-signOut');
export const menuCart = document.getElementById('menu-cart');
export const menuProfile = document.getElementById('menu-profile');
export const shoppingCartCount = document.getElementById('shoppingcart-count');


//modals
export const signInModal = new bootstrap.Modal(document.getElementById('modal-signIn'),{backdrop:'static'});
export const infoModal = new bootstrap.Modal(document.getElementById('modal-info'),{backdrop:'static'});
export const infoBody = document.getElementById('modal-info-body');
export const infoTitle = document.getElementById('modal-info-title');
export const purchaseHistoryDetailsModal = new bootstrap.Modal(document.getElementById('modal-purchase-history-details'),{backdrop:'static'});
export const purchaseHistoryDetailsTitle = document.getElementById('purchase-history-details-title');
export const purchaseHistoryDetailsBody = document.getElementById('purchase-history-details-body');
export const signUpModal = new bootstrap.Modal(document.getElementById('modal-sign-up'),{backdrop:'static'});

//forms
export const signInForm = document.getElementById('signIn-form');
export const signUpForm = document.getElementById('sign-up-form');
export const signUpFormPasswordError = document.getElementById('sign-up-form-password-error');


export const signUpButton = document.getElementById('signUpButton');
