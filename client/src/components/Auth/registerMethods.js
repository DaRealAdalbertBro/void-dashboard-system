import Axios from 'axios'

// Import the validation functions
import { isUsernameValid, isEmailValid, isPasswordValid } from '../../utils/validateInput';

// Register a new user
export const register = async (username, email, password, navigate) => {
    return new Promise((resolve, reject) => {
        // check if data is valid
        if (!isRegisterValid(username, email, password).status) {
            return reject({ status: false, message: 'Invalid username, email or password.' });
        }

        // Create a new abort controller
        const controller = new AbortController();

        // Send a POST request to the server
        Axios.post('http://localhost:3001/api/post/register', {
            username: username,
            email: email,
            password: password,
            signal: controller.signal,
            validateStatus: (status) => {
                // Resolve only if the status code is less than 500
                // This is because we want to handle 500 (server) errors ourselves
                return status < 500;
            }
        }).then((response) => {
            // If the registration was successful, redirect to the dashboard
            if (response.data.status || response.data.message == 'Registration successful') {
                resolve({ status: true, message: response.data.message })
                return navigate('/dashboard');
            }

            // If the registration was not successful, send an error message
            return reject({ status: false, message: response.data.message });

        }).catch((error) => {
            if (error.name === "CanceledError") {
                return;
            }
            // If the server is down, show an error message
            // This is because we are not handling 500 (server) errors ourselves
            console.log(error)
            return reject({ status: false, message: 'Something went wrong. Please try again later.' });
        }); // end of Axios.post

        console.log("Axios sent register")

        // cleanup, abort request
        return () => controller.abort();

    }); // end of promise
}

export const IsInputValid = (event, type, setState) => {
    // Get the value of the input
    const value = event.target.value;

    // check length of the value
    if (value.length === 0) {
        // If the input is empty, don't show an error message and icon
        event.target.parentElement.children[2].style.opacity = "0";
        // If the value is empty, return the value
        return { status: true, value: value };
    }

    // Check if the input is valid
    let isValid;
    switch (type) {
        case 'username':
            isValid = isUsernameValid(value);
            break;
        case 'email':
            isValid = isEmailValid(value);
            break;
        case 'password':
            isValid = isPasswordValid(value);
            break;
        default:
            break;
    }

    // Set the state of the input
    // This state is sent to the register() function
    setState(isValid.value)

    // If the input is invalid, show an error message and icon
    // If the input is valid, hide the error message and icon
    event.target.parentElement.children[2].style.opacity = isValid.status ? "0" : "1";
    // If the input is valid, return the value
    return { status: isValid.status, value: isValid.value };
}

export const isRegisterValid = (username, email, password) => {
    // Check if the username, email and password are valid
    const usernameValid = isUsernameValid(username);
    const emailValid = isEmailValid(email);
    const passwordValid = isPasswordValid(password);

    // Return the status and values of the inputs
    return {
        status: usernameValid.status && emailValid.status && passwordValid.status,
        username: usernameValid.value,
        email: emailValid.value,
        password: passwordValid.value
    };
}