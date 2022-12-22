import { useEffect, useState, useRef } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { FaUserAlt, FaLock } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";



const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const formRef = useRef();
    const navigate = useNavigate();

    Axios.defaults.withCredentials = true;

    const login = () => {
        Axios.post('http://localhost:3001/login', {
            username: username,
            password: password,
            validateStatus: (status) => {
                return status < 500;
            }
        }).then((response) => {

            setLoginError(response.data.message);

            if (response.data.message.includes("Logged in successfully")) {
                return navigate('/dashboard');
            }


        }).catch((error) => {
            if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                setLoginError('Something went wrong. Please try again later.');
            }

        });
    }

    const validateUsername = (e) => {
        let username = e.target.value;
        let errorMessage = "";

        if (username.length < 4 || username.length > 32) {
            if (loginError.includes('password')) {
                errorMessage += " and password";
            }

            setLoginError('Invalid username' + errorMessage);

            e.target.parentElement.children[2].style.opacity = "1";
        }
        else {
            if (loginError.includes('password')) {
                setLoginError('Invalid password');
            }
            else {
                setLoginError('');
            }

            e.target.parentElement.children[2].style.opacity = "0";
        }

        setUsername(username);


    }

    const validatePassword = (e) => {
        let password = e.target.value;
        let errorMessage = "Invalid "

        if (password.length < 8 || password.length > 255) {
            if (loginError.includes('username')) {
                errorMessage += "username and ";
            }

            setLoginError(errorMessage + 'password');

            e.target.parentElement.children[2].style.opacity = "1";
        }
        else {
            if (loginError.includes('username')) {
                setLoginError('Invalid username');
            }
            else {
                setLoginError('');
            }

            e.target.parentElement.children[2].style.opacity = "0";
        }

        setPassword(password);
    }


    useEffect(() => {
        formRef.current.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        Axios.get('http://localhost:3001/login').then((response) => {
            if (response.data.loggedIn) {
                return navigate('/dashboard');
            }
        });

    }, []);

    return (
        <div className="login-container">

            <div className="login-box">
                <form className="login-form" ref={formRef}>
                    <h1>Login</h1>

                    <div className="login-input">
                        <FaUserAlt />

                        <input type="text" placeholder="Enter username" onChange={(e) => {
                            validateUsername(e);
                        }} />

                        <div className="username-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-input">
                        <FaLock />

                        <input type="password" placeholder="Enter password" onChange={(e) => {
                            validatePassword(e);
                        }} />

                        <div className="password-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-error">{loginError}</div>


                    <button type="submit" className="login-button" onClick={() => login()}>Continue</button>

                </form>

            </div>

            <img src="/assets/loginwave.svg" alt="" />

        </div>

    );
};

export default LoginPage;