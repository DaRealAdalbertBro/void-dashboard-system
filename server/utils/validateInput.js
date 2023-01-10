const validator = require('validator').default;
const emailValidator = require('deep-email-validator');
const CONFIG = require("../config.json");

const isEmpty = (value) => {
    return value === null || value === undefined || validator.isEmpty(value.toString());
}

const isUserIdValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    // escape the input from dangerous characters
    value = validator.escape(value.toString());
    value = validator.trim(value);

    // try parsing input
    try {
        value = parseInt(value);
    } catch (error) {
        return { status: false, value: value };
    }

    // return true if parsed
    return { status: true, value: value };
}

const isUsernameValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    value = validator.escape(value.toString());
    value = validator.trim(value);

    if (CONFIG.defaults.DEFAULT_ALLOW_SPECIAL_CHARACTERS) {
        // replace using regex
        value = value.replace(/[^\w\s.-]/gi, '');

        // remove 3 dots, dashes or underscores in a row to prevent abuse
        value = value.replace(/(\.{3,})|(-{3,})|(_{3,})/g, '');
    }

    // check the length of the username
    if (value.length < 4 || value.length > 32 || Buffer.byteLength(value, "utf-8") > 64) {
        // remove all extra characters if the length is too long
        return { status: false, value: value.slice(0, 32) };
    }

    // return the value if all checks passed
    return { status: true, value: value };
}

const isTagValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    value = validator.escape(value.toString());
    value = validator.trim(value);
    value = value.replace(/[^0-9]/g, '');

    return { status: true, value: value };
}

const isPasswordValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    value = validator.escape(value.toString());
    value = validator.trim(value);

    // check the length of the password
    if (value.length < 8 || value.length > 255 || Buffer.byteLength(value, "utf-8") > 255) {
        return { status: false, value: value.slice(0, 255) };
    }

    // return the value if all checks passed
    return { status: true, value: value };
}

const isEmailValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    // validate email with validator
    value = validator.escape(value.toString());
    value = validator.trim(value);

    // check if the email is valid using a regex
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return { status: regex.test(value), value: value };
}

const isPermissionLevelValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    value = validator.escape(value.toString());
    value = validator.trim(value);
    const permissionLevelObject = CONFIG.permissions;

    // parse value
    try {
        value = parseInt(value);
    } catch (error) {
        return { status: false, value: value };
    }

    let isValid = false;

    // go through the permission level object and check if the value is between them
    Object.keys(permissionLevelObject).forEach((key) => {
        if (value >= permissionLevelObject[key] && value <= permissionLevelObject[key]) {
            // return true if the value is between the permission level
            isValid = true;
        }
    });

    // return false if the value is not between the permission level
    return { status: isValid, value: value };
}

const isAvatarUrlValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    // check if url target is an image
    const regex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
    return { status: regex.test(value), value: value };
}

const isBannerColorValid = (value) => {
    if (isEmpty(value)) {
        return { status: false, value: value };
    }

    value = validator.escape(value.toString());
    value = validator.trim(value);

    return { status: true, value: value };
}

// export functions
module.exports = function () {
    return {
        isUsernameValid,
        isTagValid,
        isPasswordValid,
        isEmailValid,
        isAvatarUrlValid,
        isPermissionLevelValid,
        isBannerColorValid,
        isUserIdValid,
        isEmpty
    };
}