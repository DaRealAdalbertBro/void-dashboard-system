import { isUsernameValid, isPasswordValid } from '../../utils/validateInput';
import Axios from 'axios';

export const login = (usernameRef, passwordRef, setLoginError, navigate) => {
    // Declare controller
    const controller = new AbortController();

    // Send login request
    Axios.post('http://localhost:3001/api/post/login', {
        username: usernameRef.current.value,
        password: passwordRef.current.value,
        signal: controller.signal,
        // Validate status code
        validateStatus: (status) => {
            // If status code is a server error, return false
            return status < 500;
        }
    }).then((response) => {
        // Set login message
        setLoginError(response.data.message);

        // If login is successful, redirect to dashboard
        if (response.data.status || response.data.message == 'Login successful') {
            return navigate('/dashboard');
        }

    }).catch((error) => {
        // If request is aborted or request failed, return
        setLoginError('Something went wrong. Please try again later.');
    });

    console.log("Axios sent login")

    // cleanup, abort request
    return () => controller.abort();
}

export const validateUsername = (e, loginError, setLoginError) => {
    let username = e.target.value;
    let errorMessage = "";

    // Check if username is valid
    if (!isUsernameValid(username)) {
        // Check if loginError includes password
        if (loginError.includes('password')) {
            errorMessage += " and password";
        }

        // Set loginError to include username
        setLoginError('Invalid username' + errorMessage);

        // Show alert icon
        e.target.parentElement.children[2].style.opacity = "1";

        // return status
        return { status: false, value: username };
    }

    // Check if loginError includes password
    if (loginError.includes('password')) {
        setLoginError('Invalid password');
    }
    else {
        setLoginError('');
    }

    // Hide alert icon
    e.target.parentElement.children[2].style.opacity = "0";

    // return status
    return { status: true, value: username };
}

export const validatePassword = (e, loginError, setLoginError) => {
    let password = e.target.value;
    let errorMessage = "";

    // Check if password is valid
    if (!isPasswordValid(password)) {
        // Check if loginError includes username
        if (loginError.includes('username')) {
            errorMessage += " and username";
        }

        // Set loginError to include password
        setLoginError('Invalid password' + errorMessage);

        // Show alert icon
        e.target.parentElement.children[2].style.opacity = "1";

        // return status
        return { status: false, value: password };
    }

    // Check if loginError includes username
    if (loginError.includes('username')) {
        setLoginError('Invalid username');
    }
    else {
        setLoginError('');
    }

    // Hide alert icon
    e.target.parentElement.children[2].style.opacity = "0";

    // return status
    return { status: true, value: password };
}