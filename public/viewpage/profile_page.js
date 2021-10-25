import * as Elements from './elements.js'
import * as Util from './util.js'
import * as Constant from '../model/constant.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'
import * as Wallet from './wallet.js'

export let accountInfo;
export function addEventListeners(){
    Elements.menuProfile.addEventListener('click', async () => {
        history.pushState(null,null,Route.routePathnames.PROFILE);
        await profile_page();
    });
}


export async function profile_page(){
    let html = '<h1>Profile Page</h1>';

    if (!Auth.currentUser) {
        Elements.root.innerHTML = '<h1>Protected Page</h1>';
        return;
    }


    if(!accountInfo){
        html += `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                        <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </symbol>
                    </svg>
                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                        <div>
                            Failed to retrieve account info for ${Auth.currentUser.email}
                        </div>
                    </div>`;
        Elements.root.innerHTML = html;
        return;
    }

    html += `
        <div class="alert alert-primary">
            Email: ${Auth.currentUser.email} (cannot change email as login name)
        </div>
    `;


    html += `
            <form class="form-profile" method="post">
                <table class="table table-sm">
                    <tr>
                        <td width="15%">Name:</td>
                        <td width="60%">
                            <input type="text" name="name" value="${accountInfo.name}"
                                placeholder="First and Last name" disabled required
                                pattern="^[A-Za-z][A-Za-z|'|-| ]+"
                            >
                        </td>
                        <td>${actionButtons()}</td>
                    </tr>
                </table>
            </form>
    `;


    html += `
            <form class="form-profile" method="post">
                <table class="table table-sm">
                    <tr>
                        <td width="15%">Address:</td>
                        <td width="60%">
                            <input type="text" name="address" value="${accountInfo.address}"
                                placeholder="Address" disabled required
                                minlength="2"
                            >
                        </td>
                        <td>${actionButtons()}</td>
                    </tr>
                </table>
            </form>
    `;


    html += `
            <form class="form-profile" method="post">
                <table class="table table-sm">
                    <tr>
                        <td width="15%">City:</td>
                        <td width="60%">
                            <input type="text" name="city" value="${accountInfo.city}"
                                placeholder="City" disabled required
                                minlength="2"
                            >
                        </td>
                        <td>${actionButtons()}</td>
                    </tr>
                </table>
            </form>
    `;

    html += `
            <form class="form-profile" method="post">
                <table class="table table-sm">
                    <tr>
                        <td width="15%">State:</td>
                        <td width="60%">
                            <input type="text" name="state" value="${accountInfo.state}"
                                placeholder="State (Uppercase 2 letter state code)" disabled required
                                pattern="[A-Z]+"
                                minlength="2" maxlength="2"
                            >
                        </td>
                        <td>${actionButtons()}</td>
                    </tr>
                </table>
            </form>
    `;

    html += `
            <form class="form-profile" method="post">
                <table class="table table-sm">
                    <tr>
                        <td width="15%">Zip code:</td>
                        <td width="60%">
                            <input type="text" name="zip" value="${accountInfo.zip}"
                                placeholder="5 digit zip code" disabled required
                                pattern="[0-9]+"
                                minlength="5" maxlength="5"
                            >
                        </td>
                        <td>${actionButtons()}</td>
                    </tr>
                </table>
            </form>
    `;

    html += `
            <form class="form-profile" method="post">
                <table class="table table-sm">
                    <tr>
                        <td width="15%">Credit Card #:</td>
                        <td width="60%">
                            <input type="text" name="creditNo" value="${accountInfo.creditNo}"
                                placeholder="Credit card number (16 digits)" disabled required
                                pattern="[0-9]+"
                                minlength="16" maxlength="16"
                            >
                        </td>
                        <td>${actionButtons()}</td>
                    </tr>
                </table>
            </form>
    `;

    html += `
        <table class="table table-sm">
            <tr>
                <td width="15%">Current Balence:</td>
                    <td width="60%">
                        <input id="profile-add-funds-value" type="text" name="creditNo" value="${Util.currency(accountInfo.currentBalence)}"
                        placeholder="$0.00" disabled required
                        pattern="[0-9][0-9|.]"
                        minlength="1" 
                        >
                    </td>
                <td><button id="profile-add-funds" class="btn btn-outline-primary">Add funds</button></td>
            </tr>
        </table>

    `;

    html += `
        <table class="table table-sm">
            <tr>
                <td>
                    <input type="file" id="profile-photo-upload-button" value="upload">
                </td>
                <td>
                    <img id="profile-img-tag" src="${accountInfo.photoURL}" width="250px" class="rounded-circle">
                </td>
                <td>
                    <button id="profile-photo-update-button" class="btn btn-outline-danger">Update Photo</button>
                </td>
            </tr>
        </table>
    `;


    Elements.root.innerHTML = html;


    document.getElementById('profile-add-funds').addEventListener('click',async ()=>{
        Wallet.profileAddfunds();
    });


    const updatePhotoButton = document.getElementById('profile-photo-update-button');
    updatePhotoButton.addEventListener('click', async () => {
        if(!photoFile){
            Util.info('No photo selected','Choose a photo to continue');
            return;
        }

        const label = Util.disableButton(updatePhotoButton);
        try {
            const photoURL = await FirebaseController.uploadProfilePhoto(photoFile,Auth.currentUser.uid);
            await FirebaseController.updateAccount(Auth.currentUser.uid, {photoURL});
            accountInfo.photoURL = photoURL;
            Elements.menuProfile.innerHTML = `
            <img src="${accountInfo.photoURL}" class="rounded-circle" height="30px">
            `;
            Util.info('Success!','Photo update complete');
        } catch (e) {
            if(Constant.DEV) console.log(e);
            Util.info('Update photo failed',JSON.stringify(e));
        }


        Util.enableButton(updatePhotoButton,label);
    });


    let photoFile;
    document.getElementById('profile-photo-upload-button').addEventListener('change', async e=> {
        photoFile = e.target.files[0];
        if(!photoFile){
            document.getElementById('profile-img-tag').src = accountInfo.photoURL;
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            document.getElementById('profile-img-tag').src = reader.result;
        };
        reader.readAsDataURL(photoFile);
    });

const forms = document.getElementsByClassName('form-profile');
for(let i = 0; i < forms.length; i++){
    forms[i].addEventListener('submit', async e=> {
        e.preventDefault();
        const inputTag = e.target.getElementsByTagName('input')[0];
        const buttons = e.target.getElementsByTagName('button');
        const buttonLabel = e.target.submitter;
        const key = inputTag.name;
        const value = inputTag.value;


        if(buttonLabel == 'Edit'){
            buttons[0].style.display = 'none';
            buttons[1].style.display = 'inline-block';
            buttons[2].style.display = 'inline-block';
            inputTag.disabled = false;
        }else if(buttonLabel == 'Update'){
            const updateInfo = {}; //updateInfo.xxx = yyy;
            updateInfo[key] = value;

            const label = Util.disableButton(buttons[1]);

            try {
                await FirebaseController.updateAccount(Auth.currentUser.uid,updateInfo);
                accountInfo[key] = value;
            } catch (e) {
                if(Constant.DEV) console.log(e)
                Util.info(`Update Failed for ${key}`,JSON.stringify(e));
            }
            Util.enableButton(buttons[1],label);

            buttons[0].style.display = 'inline-block';
            buttons[1].style.display = 'none';
            buttons[2].style.display = 'none';
            inputTag.disabled = true;
        }else{
            buttons[0].style.display = 'inline-block';
            buttons[1].style.display = 'none';
            buttons[2].style.display = 'none';
            inputTag.disabled = true;
            inputTag.value = accountInfo[key];
        }
    });
}

}

function actionButtons(){
    return `
        <button onclick="this.form.submitter='Edit'"
         class="btn btn-outline-primary" type="submit">Edit</button>

        <button onclick="this.form.submitter='Update'"
         class="btn btn-outline-danger" type="submit" style="display: none;">Update</button>

        <button onclick="this.form.submitter='Cancel'" formnovalidate="true"
         class="btn btn-outline-secondary" type="submit" style="display: none;">Cancel</button>
    `;
}


export async function getAccountInfo(user){

    try {
        accountInfo = await FirebaseController.getAccountInfo(user.uid);
    } catch (e) {
        if(Constant.DEV) console.log(e);
        Util.info(`Failed to retrieve account info for ${user.email}`,JSON.stringify(e));
        accountInfo = null;
        return;
    }

    Elements.walletAmount.innerHTML = Util.currency(accountInfo.currentBalence);
    
    Elements.menuProfile.innerHTML = `
            <img src="${accountInfo.photoURL}" class="rounded-circle" height="30px">
    `;
}


export async function updateAccountBalence(balence){
    accountInfo.currentBalence = balence;
    document.getElementById('profile-add-funds-value').value = Util.currency(accountInfo.currentBalence);
}