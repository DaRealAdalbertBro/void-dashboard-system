import { allowSpecialCharactersInUsername } from '../components/globalVariables';
import { Buffer } from 'buffer';
import { UNSAFE_enhanceManualRouteObjects } from 'react-router';


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
        if ((value[value.length - 1] == '.' && value[value.length - 2] == '.' && value[value.length - 3] == '.')
            || (value[value.length - 1] == '-' && value[value.length - 2] == '-' && value[value.length - 3] == '-')
            || (value[value.length - 1] == '_' && value[value.length - 2] == '_' && value[value.length - 3] == '_')) {
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

    // return thhe value if all checks passed
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

    // if email is valid and input has error class, remove error class
    if (validateData.status && e.target.classList.contains("error")) {
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
        || isTagValid(user_tag).status) {
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

    // if there is no valid data, return false
    // otherwise return true
    return {
        status: !Object.keys(updateObject).length == 0,
        value: updateObject
    };
}