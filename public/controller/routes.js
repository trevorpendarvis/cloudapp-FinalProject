import * as Home from '../viewpage/home_page.js'
import * as Cart from '../viewpage/cart.js'
import * as Profile from '../viewpage/profile_page.js'
import * as Purchases from '../viewpage/purchases_page.js'
import * as Products from '../viewpage/products_page.js'
import * as User from '../viewpage/users_page.js'
import * as AdminHome from '../viewpage/admin_home_page.js'
import * as DetailView from '../viewpage/details_product_page.js'
import * as Wishlist from '../viewpage/wishlist_page.js'


export const routePathnames = {
    HOME:'/',
    ADMIN:'/admin',
    CART:'/cart',
    PROFILE:'/profile',
    PURCHASES:'/purchases',
    PRODUCTS:'/products',
    USERS:'/users',
    DETAILS:'/details',
    WISHLIST:'/wishlist',
};

export const routes = [
    {pathname: routePathnames.HOME, page:Home.home_page},
    {pathname:routePathnames.CART, page:Cart.cart_page},
    {pathname: routePathnames.PROFILE, page:Profile.profile_page},
    {pathname: routePathnames.PURCHASES, page: Purchases.purchases_page},
    {pathname:routePathnames.PRODUCTS, page: Products.products_page},
    {pathname:routePathnames.USERS, page: User.users_page},
    {pathname:routePathnames.ADMIN,page: AdminHome.admin_home_page},
    {pathname:routePathnames.DETAILS, page: DetailView.detailProductPage},
    {pathname:routePathnames.WISHLIST, page:Wishlist.wishlist_page},
];


export function routing(pathname, hash){
    const route = routes.find(r => r.pathname == pathname);
    if(route){
        if(hash && hash.length > 1){
         route.page(hash.substring(1));
        }else route.page();
    }else routes[0].page();
}