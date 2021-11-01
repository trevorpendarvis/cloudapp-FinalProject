import * as Element from './elements.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import * as Constant from '../model/constant.js'

export function addEventListeners(){
    Element.menuAdminHome.addEventListener('click', () => {
        history.pushState(null,null,Route.routePathnames.ADMIN);
        admin_home_page();
    });
}



export async function admin_home_page(){

  if(!Auth.currentUser || !Constant.adminEmails.includes(Auth.currentUser.email)){
      history.replaceState(null,null,Route.routePathnames.HOME);
      Route.routing(Route.routePathnames.HOME);
      return;
  }

    let html = `
    <div class="modal-pre-auth text-center">
    <div class="col-md-12">
      <h3>Welcome to Admin's home page</h3>
      <h4>Take a look around:)</h4>
    </div>
  </div>
    `;

    Element.root.innerHTML = html;
}