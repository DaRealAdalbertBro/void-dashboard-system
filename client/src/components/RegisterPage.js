import { useEffect, useState, useRef } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { FaUserAlt, FaLock } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { MdOutlineAlternateEmail } from "react-icons/md";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [registerError, setRegisterError] = useState('');
    const formRef = useRef();
    const navigate = useNavigate();

    Axios.defaults.withCredentials = true;

    const register = () => {
        Axios.post('http://localhost:3001/register', {
            username: username,
            email: email,
            password: password,
            validateStatus: (status) => {
                return status < 500;
            }
        }).then((response) => {

            setRegisterError(response.data.message);

            if (response.data.message.includes("been registered")) {
                return navigate('/dashboard');
            }


        }).catch((error) => {
            if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                setRegisterError('Something went wrong. Please try again later.');
            }

        });
    }

    const validateUsername = (e) => {
        let username = e.target.value;
        let errorMessage = "";

        if (username.length < 4 || username.length > 32) {
            if (registerError.includes('password')) {
                errorMessage += " and password";
            }

            setRegisterError('Invalid username' + errorMessage);

            e.target.parentElement.children[2].style.opacity = "1";
        }
        else {
            if (registerError.includes('password')) {
                setRegisterError('Invalid password');
            }
            else {
                setRegisterError('');
            }

            e.target.parentElement.children[2].style.opacity = "0";
        }

        setUsername(username);


    }

    const validateEmail = (e) => {
        let email = e.target.value;
        let errorMessage = "Invalid ";

        if (email.length < 4 || email.length > 255) {
            if (registerError.includes('username')) {
                errorMessage += "username and ";
            }

            setRegisterError(errorMessage + 'email');

            e.target.parentElement.children[2].style.opacity = "1";
        }
        else {
            if (registerError.includes('username')) {
                setRegisterError('Invalid username');
            }
            else {
                setRegisterError('');
            }

            e.target.parentElement.children[2].style.opacity = "0";
        }

        setEmail(email);
    }

    const validatePassword = (e) => {
        let password = e.target.value;
        let errorMessage = "Invalid "

        if (password.length < 8 || password.length > 255) {
            if (registerError.includes('username')) {
                errorMessage += "username and ";
            }

            setRegisterError(errorMessage + 'password');

            e.target.parentElement.children[2].style.opacity = "1";
        }
        else {
            if (registerError.includes('username')) {
                setRegisterError('Invalid username');
            }
            else {
                setRegisterError('');
            }

            e.target.parentElement.children[2].style.opacity = "0";
        }

        setPassword(password);
    }


    useEffect(() => {
        formRef.current.addEventListener('submit', (e) => {
            e.preventDefault();
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
                        <MdOutlineAlternateEmail />

                        <input type="email" placeholder="Enter email" onChange={(e) => {
                            validateEmail(e);
                        }} />

                        <div className="email-alert-icon">
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

                    <div className="login-error">{registerError}</div>


                    <button type="submit" className="login-button" onClick={() => register}>Continue</button>

                </form>

            </div>

            <img src="/assets/loginwave.svg" alt="" />

        </div>

    );
};

export default RegisterPage;