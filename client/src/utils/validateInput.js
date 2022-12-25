import { allowSpecialCharactersInUsername, defaultProfilePicture } from '../components/globalVariables';
import { Buffer } from 'buffer';
import { getAverageColor } from './utils';

export const isUsernameValid = (value) => {
    // look for special characters if enabled
    if (!allowSpecialCharactersInUsername) {
        const regex = /^[0-9a-zA-Z_.-]+$/;
        // test if value contains special characters
        if (!regex.test(value)) {
            // remove the last character if it is a special character
            return { status: false, value: value.slice(0, -1) };
        }

        // check for 3 dots, dashes or underscores in a row to prevent abuse
        if ((value[value.length - 1] === '.' && value[value.length - 2] === '.' && value[value.length - 3] === '.')
            || (value[value.length - 1] === '-' && value[value.length - 2] === '-' && value[value.length - 3] === '-')
            || (value[value.length - 1] === '_' && value[value.length - 2] === '_' && value[value.length - 3] === '_')) {
            // remove the last character if the repetition is found
            return { status: false, value: value.slice(0, -1) };
        }
    }

    // check the length of the username
    if (value.length < 4 || value.length > 32 || Buffer.byteLength(value, "utf-8") > 64) {
        // remove all extra characters if the length is too long
        return { status: false, value: value.slice(0, 32) };
    }

    // return the value if all checks passed
    return { status: true, value: value };
};


export const isTagValid = (value) => {
    // look for special characters
    const regex = /^[0-9]+$/;
    // test if value contains special characters
    if (!regex.test(value)) {
        // remove the last character if it is a special character
        return { status: false, value: value.slice(0, -1) };
    }

    return { status: true, value: value };
};


export const isPasswordValid = (value) => {
    // check the length of the password
    if (value.length < 8 || value.length > 255 || Buffer.byteLength(value, "utf-8") > 255) {
        return { status: false, value: value.slice(0, 255) };
    }

    // return the value if all checks passed
    return { status: true, value: value };
};


export const isEmailValid = (value) => {
    // check the length of the email
    if (value.length === 0) {
        return { status: false, value: value };
    }

    if (value.length < 4 || value.length > 255 || Buffer.byteLength(value, "utf-8") > 255) {
        return { status: false, value: value.slice(0, 255) };
    }

    // check if the email is valid using a regex
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;;
    return { status: regex.test(value), value: value };
};


export const isInputValidShowErrors = (e, type) => {
    // validate email
    let validateData;

    if (type === "email") {
        validateData = isEmailValid(e.target.value);
    }
    else if (type === "tag") {
        validateData = isTagValid(e.target.value);
    }
    else if (type === "username") {
        validateData = isUsernameValid(e.target.value);
    }
    else if (type === "password_match") {
        // get the password inputs
        const password = document.querySelector("#user-new-password-settings");
        const passwordConfirm = document.querySelector("#user-new-password-confirm-settings");

        // check if the password is valid
        validateData = doPasswordsMatch(password.value, passwordConfirm.value);

        console.log(validateData)

        // add error class if passwords don't match
        if (!validateData.status) {
            password.classList.add("error");
            passwordConfirm.classList.add("error");
        } else {
            password.classList.remove("error");
            passwordConfirm.classList.remove("error");
        }

        return validateData.value;
    }
    else if (type === "password") {
        validateData = isPasswordValid(e.target.value);
    }

    // if email is valid and input has error class, remove error class
    if ((validateData.status && e.target.classList.contains("error")) || e.target.value.length === 0) {
        e.target.classList.remove("error");
    } else if (!validateData.status && !e.target.classList.contains("error")) {
        e.target.classList.add("error");
    }

    return validateData.value;
};


export const isUpdateValid = (data) => {
    const user_name = document.querySelector(".user-name-settings").value.trim() || data.user_name;
    const user_tag = document.querySelector(".user-tag-settings").value.trim() || data.user_tag;
    const user_email = document.querySelector(".user-email-settings").value.trim();

    let updateObject = {};

    updateObject.user_id = data.user_id;

    if (!updateObject.user_id) {
        return {
            status: false,
            value: updateObject
        };
    }

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

export const isFileUpdateValid = (data, image) => {
    return new Promise((resolve, reject) => {
        // create form data
        const formData = new FormData();

        if (!data.user_id) {
            return {
                status: false,
                value: {}
            };
        }

        formData.append("user_id", data.user_id);

        if (isFileValid(image).status) {
            formData.append("user_avatar_file", image);

            // create image element with src of image
            const imgElement = document.createElement("img");
            imgElement.src = URL.createObjectURL(image);

            imgElement.onload = () => {
                // get image average coloG
                const averageColor = getAverageColor(imgElement, 1);

                // append the average color to the form data
                formData.append("user_banner_color", `[${averageColor.R},${averageColor.G},${averageColor.B}]`);

                // check if the image is different from the current image
                if (data.user_avatar_file !== image.name) {
                    return resolve({
                        status: true,
                        value: formData
                    });

                }

                // // revoke the image url
                // URL.revokeObjectURL(imgElement.src);

                // imgElement.remove();

                return reject({
                    status: false,
                    value: {}
                });
            }

        } else {
            return reject({ status: false, value: {} })
        }

    }); // end of promise
}


export const isPasswordUpdateValid = (data) => {
    const user_old_password = document.querySelector("#user-old-password-settings").value.trim();
    const user_new_password = document.querySelector("#user-new-password-settings").value.trim();
    const user_new_password_confirm = document.querySelector("#user-new-password-confirm-settings").value.trim();

    let updateObject = {};

    updateObject.user_id = data.user_id;

    if (!updateObject.user_id) {
        return {
            status: false,
            value: updateObject
        };
    }

    // first check if data is valid
    if (isPasswordValid(user_old_password).status
        && isPasswordValid(user_new_password).status
        && isPasswordValid(user_new_password_confirm).status
        && user_new_password === user_new_password_confirm) {
        updateObject.user_old_password = user_old_password;
        updateObject.user_new_password = user_new_password;
        updateObject.user_repeat_new_password = user_new_password_confirm;
    }

    // check if object contains any data other than user_id
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

export const doPasswordsMatch = (pass1, pass2) => {
    let state = true;
    // check if the passwords match
    if (pass1 !== pass2 || !(isPasswordValid(pass1).status && isPasswordValid(pass2).status)) {
        state = false;
    }

    // return the state and the passwords
    return { status: state, value: [pass1, pass2] };
}

export const isFileValid = (file) => {

    // check if file is valid
    if (!file) {
        return { status: false, value: file };
    }

    // check if the file has higher than 8mb
    if (file.size > 8000000) {
        return { status: false, value: file };
    }

    // check if the file is an image
    if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/gif"
        && file.type !== "image/jfif" && file.type !== "image/bmp" && file.type !== "image/webp") {
        return { status: false, value: file };
    }

    // otherwise return true
    return { status: true, value: file };
}