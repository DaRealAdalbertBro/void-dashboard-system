// Import modules
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// import icons
import { FaUserAlt, FaLock } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";

// import login methods
import { validateUsername, validatePassword, login } from './loginMethods';
import { isUserLoggedIn } from '../../utils/utils';


const LoginPage = () => {
    const [loginError, setLoginError] = useState('');
    const formRef = useRef();
    const usernameRef = useRef();
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

                        <input type="text" placeholder="Enter username" ref={usernameRef} onChange={(e) => {
                            validateUsername(e, loginError, setLoginError);
                        }} />

                        <div className="username-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-input">
                        <FaLock />

                        <input type="password" placeholder="Enter password" ref={passwordRef} onChange={(e) => {
                            validatePassword(e, loginError, setLoginError);
                        }} />

                        <div className="password-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-error">{loginError}</div>


                    <button type="submit" className="login-button" onClick={() => login(usernameRef, passwordRef, setLoginError, navigate)}>Continue</button>

                </form>

            </div>

            <img src="/assets/loginwave.svg" alt="" />

        </div>

    );
};

export default LoginPage;