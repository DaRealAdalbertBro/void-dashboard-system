// Import modules
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// import icons
import { FaUserAlt, FaLock } from "react-icons/fa";

// import login methods
import { login } from './loginMethods';
import { isUserLoggedIn } from '../../utils/utils';
import { isEmailValid, isPasswordValid } from '../../utils/validateInput';

// import css
import './LoginPage.css';

const LoginPage = () => {
    const [loginError, setLoginError] = useState('');
    const formRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        // Prevent form from submitting, so we can handle it with JS
        formRef.current.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        // Check if user is already logged in
        isUserLoggedIn(navigate);

        // Set document title
        document.title = 'Login | Void';
    }, [navigate]);

    return (
        <div className="login-container">

            <div className="login-box">
                <form className="login-form" ref={formRef}>
                    <h1>Login</h1>

                    <div className="login-input">
                        <FaUserAlt />

                        <input type="text" placeholder="Enter email" ref={emailRef} onChange={(e) => {
                            e.currentTarget.value = isEmailValid(e.currentTarget.value).value
                        }} />
                    </div>

                    <div className="login-input">
                        <FaLock />

                        <input type="password" placeholder="Enter password" ref={passwordRef} onChange={(e) => {
                            e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                        }} />
                    </div>

                    <div className="login-error">{loginError}</div>


                    <button type="submit" className="login-button" onClick={() => login(emailRef, passwordRef, setLoginError, navigate)}>Continue</button>

                </form>

            </div>

            <img src="/assets/images/loginwave.svg" alt="" />

        </div>

    );
};

export default LoginPage;