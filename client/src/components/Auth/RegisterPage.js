import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// import react icons
import { FaUserAlt, FaLock } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { MdOutlineAlternateEmail } from "react-icons/md";

// import register methods
import { register, IsInputValid, isRegisterValid } from './registerMethods';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [canSaveButton, setCanSaveButton] = useState(false);
    const formRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        // Prevents the form from submitting when the user presses enter
        // This is handled by the Axios request instead
        formRef.current.addEventListener('submit', (e) => {
            e.preventDefault();
        });

    }, []);

    // set the document title
    useEffect(() => {
        document.title = "Register | Void";
    }, [navigate]);

    useEffect(() => {
        // Check if the inputs are valid
        if (isRegisterValid(username, email, password).status) {
            // If the inputs are valid, enable the save button
            return setCanSaveButton(true);
        }

        // If the inputs are not valid, disable the save button
        setCanSaveButton(false);

    }, [username, email, password]);

    return (
        <div className="login-container">

            <div className="login-box">
                <form className="login-form" ref={formRef}>
                    <h1>Register</h1>

                    <div className="login-input">
                        <FaUserAlt />

                        <input autoComplete="new-password" type="text" placeholder="Enter username" onChange={(e) => {
                            e.currentTarget.value = IsInputValid(e, "username", setUsername).value;
                        }} />

                        <div className="username-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-input">
                        <MdOutlineAlternateEmail />

                        <input autoComplete="new-password" type="email" placeholder="Enter email" onChange={(e) => {
                            e.currentTarget.value = IsInputValid(e, "email", setEmail).value;
                        }} />

                        <div className="email-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-input">
                        <FaLock />

                        <input autoComplete="new-password" type="password" placeholder="Enter password" onChange={(e) => {
                            e.currentTarget.value = IsInputValid(e, "password", setPassword).value;
                        }} />

                        <div className="password-alert-icon">
                            <FiAlertCircle />
                        </div>
                    </div>

                    <div className="login-error">{registerError}</div>


                    <button type="submit" className={`login-button ${canSaveButton ? '' : ' disabled'}`} onClick={async () => {
                        // check if can be saved
                        if (!canSaveButton) return;

                        // send the register request
                        const reg = await register(username, email, password, navigate)
                            .then(response => response)
                            .catch(err => err);

                        // show the error message and disable the save button after the request is done
                        setRegisterError(reg.message);
                        setCanSaveButton(false);

                    }}>Continue</button>

                </form>

            </div>

            <img src="/assets/loginwave.svg" alt="" />

        </div>

    );
};

export default RegisterPage;