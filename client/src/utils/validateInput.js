import { allowSpecialCharactersInUsername } from '../components/globalVariables';
import { Buffer } from 'buffer';

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
    const regex = /^\d+$/;
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

    switch (type) {
        case "email":
            validateData = isEmailValid(e.target.value);
            break;
        case "tag":
            validateData = isTagValid(e.target.value);
            break;

        case "username":
            validateData = isUsernameValid(e.target.value);
            break;

        case "password_match":
            // get the password inputs
            const password = document.querySelector("#user-new-password-settings");
            const passwordConfirm = document.querySelector("#user-new-password-confirm-settings");

            // check if the password is valid
            validateData = doPasswordsMatch(password.value, passwordConfirm.value);

            // add error class if passwords don't match
            if (!validateData.status) {
                password.classList.add("error");
                passwordConfirm.classList.add("error");
            } else {
                password.classList.remove("error");
                passwordConfirm.classList.remove("error");
            }

            // return the passwords
            return validateData.value;

        case "password":
            validateData = isPasswordValid(e.target.value);
            break;

        default:
            break;
    }

    // if email is valid and input has error class, remove error class
    if ((validateData.status && e.target.classList.contains("error")) || e.target.value.length === 0) {
        e.target.classList.remove("error");
    } else if (!validateData.status && !e.target.classList.contains("error")) {
        e.target.classList.add("error");
    }

    return validateData.value;
};


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