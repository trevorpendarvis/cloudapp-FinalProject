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

//forms
export const signInForm = document.getElementById('signIn-form');