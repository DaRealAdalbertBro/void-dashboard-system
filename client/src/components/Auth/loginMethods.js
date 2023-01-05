import Axios from 'axios';
import { apiServerIp } from '../globalVariables';

export const login = (usernameRef, passwordRef, setLoginError, navigate) => {
    // Declare controller
    const controller = new AbortController();

    // Send login request
    Axios.post(apiServerIp + '/api/post/login', {
        username: usernameRef.current.value,
        password: passwordRef.current.value
    }, {
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
        if (response.data.status) {
            return navigate('/dashboard');
        }

    }).catch(error => {
        if (error.name === "CanceledError") {
            return;
        }

        // If server is down, show error message
        setLoginError('Something went wrong. Please try again later.');
    });

    console.log("Axios sent login")

    // cleanup, abort request
    return () => controller.abort();
}