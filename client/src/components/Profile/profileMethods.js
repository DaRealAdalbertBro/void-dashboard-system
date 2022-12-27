// Description: This file contains all the methods used in the profile component

import Axios from "axios";
import { isUsernameValid, isTagValid, isEmailValid, isFileValid, isPasswordValid } from "../../utils/validateInput";
import { getAverageColor } from "../../utils/utils";
import { UpdateCustomPopup } from "../CustomPopup";

/////////////////////////////////////////////
// * VALID OPTIONS: *
// type: "<userinfo/password/avatar>" - update user info, password or avatar
// canSave: [<useState value>, <useState set function>] - stores if settings can be saved
// popupMethods: [<setPopupActive>, <setPopupTitle>, <setPopupDescription>]
// avatarFile: <useState value> - stores avatar file
/////////////////////////////////////////////
export const submitSettings = async (data, options = { type: "userinfo" }) => {

    // check if settings can be saved
    if (!options.canSave[0]) {
        return false;
    }

    let canUpdateData;

    // check if update is valid
    switch (options.type) {
        case "userinfo":
            canUpdateData = await isUpdateValid(data);
            break;

        case "password":
            canUpdateData = await isPasswordUpdateValid(data);
            break;

        case "avatar":
            canUpdateData = await isAvatarUpdateValid(data, options.avatarFile)
                .then(response => response)
                .catch(error => error);
            break;

        default:
            break;
    }

    // declare popup context from options object
    const popupContext = options.popupContext;

    if (!canUpdateData.status) {
        // show error popup
        UpdateCustomPopup(popupContext.active, popupContext.title, popupContext.message);
        return false;
    }

    // send update request
    const response = await Axios.post("http://localhost:3001/api/post/updateuser",
        canUpdateData.value,
        { headers: { ...canUpdateData.headers } })
        .then(response => response)
        .catch(err => err);

    // if update was successful
    if (response.data && response.data.status) {
        // reload page
        return window.location.reload();
    }

    // show error popup
    UpdateCustomPopup(popupContext.active,
        popupContext.title,
        [
            (response.data && response.data.message) || popupContext.message[0],
            popupContext.message[1]
        ]
    );
}

// check if user update is valid
export const isUpdateValid = (data) => {
    // get user data from input fields
    const user_name = document.querySelector(".user-name-settings").value.trim() || data.user_name;
    const user_tag = document.querySelector(".user-tag-settings").value.trim() || data.user_tag;
    const user_email = document.querySelector(".user-email-settings").value.trim();

    let updateObject = {};

    // check if user_id exists
    if (!data.user_id) {
        return {
            status: false,
            value: updateObject
        };
    }

    // add user_id to updateObject
    updateObject.user_id = data.user_id;

    // first check if data is valid
    if (isUsernameValid(user_name).status
        && isTagValid(user_tag).status) {
        updateObject.user_name = user_name;
        updateObject.user_tag = user_tag;
    }

    if (isEmailValid(user_email).status) {
        updateObject.user_email = user_email;
    }

    // if there is valid data, check if it is different from current data

    if (updateObject.user_name === data.user_name && updateObject.user_tag === data.user_tag) {
        delete updateObject.user_name;
        delete updateObject.user_tag;
    }

    if (updateObject.user_email === data.user_email) {
        delete updateObject.user_email;
    }

    // check if there is any data to update than the user_id
    if (Object.keys(updateObject).length <= 1) {
        return {
            status: false,
            value: updateObject
        };
    }

    // otherwise return true
    return {
        status: true,
        value: updateObject
    };
}

// check if avatar update is valid
export const isAvatarUpdateValid = (data, image) => {
    return new Promise((resolve, reject) => {
        // create form data
        const formData = new FormData();

        // check if user id is valid
        if (!data.user_id) {
            return {
                status: false,
                value: {}
            };
        }

        // append user id to form data
        formData.append("user_id", data.user_id);

        // check if image is valid
        if (!isFileValid(image).status) {
            return reject({ status: false, value: {} });
        }

        // append image to form data
        formData.append("user_avatar_file", image);

        // create image element with src of image
        const imgElement = document.createElement("img");
        imgElement.src = URL.createObjectURL(image);

        // wait for image to load
        imgElement.onload = () => {
            // get image average color and append it to the form data
            const averageColor = getAverageColor(imgElement, 1);
            formData.append("user_banner_color", `[${averageColor.R},${averageColor.G},${averageColor.B}]`);

            // TODO - check if image is different from current image, not working right now, because of the file name being different all the time
            if (data.user_avatar_file !== image.name) {
                return resolve({ status: true, value: formData, headers: { "Content-Type": "multipart/form-data" } });

            }

            // revoke object url if all checks fail
            URL.revokeObjectURL(imgElement.src);

            // remove image element
            imgElement.remove();

            return reject({ status: false, value: {} });
        }


    }); // end of promise
}

// check if password update is valid
export const isPasswordUpdateValid = (data) => {
    const user_old_password = document.querySelector("#user-old-password-settings").value.trim();
    const user_new_password = document.querySelector("#user-new-password-settings").value.trim();
    const user_new_password_confirm = document.querySelector("#user-new-password-confirm-settings").value.trim();

    let updateObject = {};

    // check if user id is valid
    if (!data.user_id) {
        return { status: false, value: updateObject };
    }

    updateObject.user_id = data.user_id;

    // first check if data is valid
    if (isPasswordValid(user_old_password).status
        && isPasswordValid(user_new_password).status
        && isPasswordValid(user_new_password_confirm).status
        && user_new_password === user_new_password_confirm) {
        // if all checks pass, add data to object
        updateObject.user_old_password = user_old_password;
        updateObject.user_new_password = user_new_password;
        updateObject.user_repeat_new_password = user_new_password_confirm;
    }

    // check if object contains any data other than user_id
    if (Object.keys(updateObject).length <= 1) {
        return { status: false, value: updateObject };
    }

    // otherwise return true
    return { status: true, value: updateObject };
}