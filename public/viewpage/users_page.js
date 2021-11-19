import * as Element from './elements.js'
import * as Route from '../controller/routes.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from './util.js'
import * as Auth from '../controller/auth.js'

export function addEventListeners(){
    Element.menuUsers.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.USERS);
        const label = Util.disableButton(Element.menuUsers);
        await users_page();
        Util.enableButton(Element.menuUsers,label);
    });
}



export async function users_page(){

  if(!Auth.isAdmin || !Auth.currentUser){
    Element.root.innerHTML = `<h1>Admins only<h1>`;
    return;
}

    let html = `
    <div class="modal-pre-auth text-center">
    <div class="col-md-12">
      <h3>Welcome to Admin's user page</h3>
      <h4>Take a look around:)</h4>
    </div>
  </div>
    `;
    let userList;
    try {
      
      userList = await FirebaseController.getUsersList();

      html += `<table class="table table-dark table-striped">
      <thead>
        <tr>
          <th scope="col">Email</th>
          <th scope="col">Status</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>`;
      userList.forEach(user => {
        html+= buildUserRow(user);
      });

      html+= '</tbody></table>';
      
    } catch (e) {
      if(Constant.DEV) console.log(e);
      Util.info('Get Users Failed',JSON.stringify(e));
    }


    Element.root.innerHTML = html;


    const toggleForms = document.getElementsByClassName('form-toggle-user');
    for(let i = 0; i < toggleForms.length; i++){
      toggleForms[i].addEventListener('submit',async e=>{
        e.preventDefault();
        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);


        const uid = e.target.uid.value;
        const disabled = e.target.disabled.value;
        const update = {
          disabled: disabled === 'true' ? false : true,
        };

        try {
          await FirebaseController.updateUser(uid,update);
          e.target.disabled.value = `${update.disabled}`;
          document.getElementById(`user-status-${uid}`)
          .innerHTML = `${update.disabled ? 'Disabled' : 'Active'}`;
          
          Util.info('User Status Toggled',`Disabled: ${update.disabled}`);
        } catch (e) {
          if(Constant.DEV) console.log(e);
          Util.info('Toggle user failed',JSON.stringify(e));
        }

        Util.enableButton(button,label);

      });
    }

    const userDeleteForm = document.getElementsByClassName('form-delete-user');
    for(let i = 0; i < userDeleteForm.length; i++){
      userDeleteForm[i].addEventListener('submit',async e=> {
        e.preventDefault();
        if(!window.confirm('Are you sure you want to delete user?')) return;
        
        const button = e.target.getElementsByTagName('button')[0];
        Util.disableButton(button);

        const uid = e.target.uid.value;

        try {
          await FirebaseController.deleteUser(uid);
          document.getElementById(`user-row-${uid}`).remove();
          Util.info('User deleted', `UserID: ${uid}`);
        } catch (e) {
          if(Constant.DEV) console.log(e);
          Util.info('Delete user failed',JSON.stringify(e));
        }
      });
    }
}


function buildUserRow(user){
  return `
  <tr id="user-row-${user.uid}">
  <td>${user.email}</td>
  <td id="user-status-${user.uid}">${user.disabled ? 'Disabled' : 'Active'}</td>
  <td>
    <form class="form-toggle-user" method="post" style="display: inline-block;">
      <input type="hidden" name="uid" value="${user.uid}">
      <input type="hidden" name="disabled" value="${user.disabled}">
      <button class="btn btn-outline-primary">Toggle active</button>
    </form>
    <form class="form-delete-user" method="post" style="display: inline-block;">
      <input type="hidden" name="uid" value="${user.uid}">
      <button class="btn btn-outline-danger">Delete</button>
    </form>
  </td>
  </tr>
  `;
}