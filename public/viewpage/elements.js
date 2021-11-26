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
export const menuWallet = document.getElementById('menu-wallet');
export const walletAmount = document.getElementById('wallet-amount');
export const menuProducts = document.getElementById('menu-products');
export const menuUsers = document.getElementById('menu-users');
export const bannerTitle = document.getElementById('banner-title');
export const menuAdminHome = document.getElementById('menu-home-admin');
export const menuWishlist = document.getElementById('menu-wishlist');



//modals
export const signInModal = new bootstrap.Modal(document.getElementById('modal-signIn'),{backdrop:'static'});
export const infoModal = new bootstrap.Modal(document.getElementById('modal-info'),{backdrop:'static'});
export const infoBody = document.getElementById('modal-info-body');
export const infoTitle = document.getElementById('modal-info-title');
export const purchaseHistoryDetailsModal = new bootstrap.Modal(document.getElementById('modal-purchase-history-details'),{backdrop:'static'});
export const purchaseHistoryDetailsTitle = document.getElementById('purchase-history-details-title');
export const purchaseHistoryDetailsBody = document.getElementById('purchase-history-details-body');
export const signUpModal = new bootstrap.Modal(document.getElementById('modal-sign-up'),{backdrop:'static'});
export const addFundsModal = new bootstrap.Modal(document.getElementById('modal-add-funds'),{backdrop:'static'});
export const modalEditReview = new bootstrap.Modal(document.getElementById('modal-edit-review'), {backdrop: 'static'});
export const modalWishlist = new bootstrap.Modal(document.getElementById('wishlist-modal'), {backdrop: 'static'});

//forms
export const signInForm = document.getElementById('signIn-form');
export const signUpForm = document.getElementById('sign-up-form');
export const signUpFormPasswordError = document.getElementById('sign-up-form-password-error');
export const addFundsForm = document.getElementById('form-add-funds');
export const editReviewForm = document.getElementById('form-edit-review');
export const wishlistForm = {
    img: document.getElementById('wishlist-form-img'),
    form: document.getElementById('plus-and-minus-form-wishlist'),
    qty: document.getElementById('product-qty-from-wishlist'),
    title: document.getElementById('wishlist-modal-title'),
    hidden: document.getElementById('product-hidden'),
    addBtn: document.getElementById('add-to-cart-from-wishlist'),
    minusBtn: document.getElementById('minus-to-cart-from-wishlist'),
    count: document.getElementById('product-qty-count'),
};



export const signUpButton = document.getElementById('signUpButton');




//AdminForms
export const addProductForm = {
    form: document.getElementById('form-add-product'),
    imageTag: document.getElementById('form-add-product-image-tag'),
    imageButton: document.getElementById('form-add-product-image-button'),
    errorName: document.getElementById('form-add-product-error-name'),
    errorPrice: document.getElementById('form-add-product-error-price'),
    errorSummary: document.getElementById('form-add-product-error-summary'),
    errorImage: document.getElementById('form-add-product-error-image'),
    
}

export const editProductForm = {
    form: document.getElementById('form-edit-product'),
    imageTag: document.getElementById('form-edit-product-image-tag'),
    imageButton: document.getElementById('form-edit-product-image-button'),
    errorName: document.getElementById('form-edit-product-error-name'),
    errorPrice: document.getElementById('form-edit-product-error-price'),
    errorSummary: document.getElementById('form-edit-product-error-summary'),
    errorImage: document.getElementById('form-edit-product-error-image'),
}

//Admin modals
export const modalAddProduct = new bootstrap.Modal(document.getElementById('modal-add-product'), {backdrop: 'static'});

export const modalEditProduct = new bootstrap.Modal(document.getElementById('modal-edit-product'), {backdrop: 'static'});
