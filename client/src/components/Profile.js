import { useNavigate, use } from "react-router-dom";
import useFetch from "./useFetch";
import { useEffect, useState } from "react";
import { FcPlus, FcServices } from "react-icons/fc";
import { HiOutlineHashtag } from "react-icons/hi";
import { MdOutlineAlternateEmail, MdOutlineLock } from "react-icons/md";
import Axios from "axios";
import { defaultProfilePicture } from './globalVariables';

import { isUsernameValid, isTagValid, isPasswordValid, isUpdateValid, isPasswordUpdateValid, isInputValidShowErrors } from "../utils/validateInput";

import "../css/Profile.css";
import { addPaddingToStringNumber, getAverageColor, averageColorToGradient } from "../utils/utils";

import { CustomPopup } from "./CustomPopup";

const Profile = () => {
    const navigate = useNavigate();

    let { data, isPending, error } = useFetch("/api/get/userinfo");
    const [userRole, setUserRole] = useState("User");
    const [canSaveSettings, setCanSaveSettings] = useState(false);
    const [canSavePassword, setCanSavePassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("Warning");
    const [popupMessage, setPopupMessage] = useState("Something went wrong... Try again later!");
    const [bannerProfileColor, setBannerProfileColor] = useState(null);

    const submitUserSettings = (data, type = "userinfo") => {

        // check if settings can be saved
        if ((type == "userinfo" && !canSaveSettings)
            || (type == "password" && !canSavePassword)) {
            return false;
        }

        const updateValid = type == "userinfo" ? isUpdateValid(data) : isPasswordUpdateValid(data);
        if (!updateValid.status) {
            console.log("update not valid")
            setShowPopup(true);
            setPopupTitle("Warning");
            setPopupMessage("Something went wrong... Try again later! Could not update user info!");
            return false;
        }

        Axios.post("http://localhost:3001/api/post/updateuser", updateValid.value)
            .then((response) => {
                // if update was successful
                if (response.data.status) {

                    // update data with new user info
                    data.user = response.data.user;

                    // reload page
                    return window.location.replace("/dashboard/profile");
                }

                // if update was not successful
                setShowPopup(true);
                setPopupTitle("Warning");
                setPopupMessage(response.data.message);


            })
            .catch((error) => {
                console.log(error);
            })

        if (type == "userinfo") {
            setCanSaveSettings(false);
        } else {
            setCanSavePassword(false);
        }
    }


    useEffect(() => {
        // set user permission level to readable format
        if (data && data.user && data.user.user_permissions) {
            switch (data.user.user_permissions) {
                case 1:
                    setUserRole("Editor");
                    break;
                case 2:
                    setUserRole("Admin");
                    break;
                default:
                    setUserRole("User");
                    break;
            }

            console.log(data.user.user_banner_color)
        }

        // get dominant color of profile picture
        const avatarElement = document.getElementById("profile-picture");
        if (!avatarElement) return;

        avatarElement.onload = () => {
            const banner = document.querySelector(".profile-container .profile");
            
            if (data && data.user
                && (data.user.user_banner_color == null || data.user.user_banner_color == "[90,113,147]")) {

                console.log("setting banner color")
                // set banner color to user's banner color
                const averageColor = getAverageColor(avatarElement, 1);

                // create gradient from this color
                const gradient = averageColorToGradient(averageColor);

                // set banner color
                banner.style.background = gradient;

                // set banner color to user's banner color
                Axios.post("http://localhost:3001/api/post/updateuser", { user_id: data.user.user_id, user_banner_color: `[${averageColor.R},${averageColor.G},${averageColor.B}]` })
                    .then((response) => {
                        // if update was successful
                        if (response.data.status) {
                            // update data with new user info
                            data.user = response.data.user;
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    }); // end of axios post

            } else {
                // set banner color to user's banner color
                const averageColor = JSON.parse(data.user.user_banner_color);
                const gradient = averageColorToGradient(averageColor);
                banner.style.backgroundImage = gradient;
            }
        }

    }, [data]);


    return (
        <div className="profile-container">
            {error && <div>{error}</div>}
            {
                (data && data.user)
                    ? (
                        <div className="profile-container">

                            {showPopup && <CustomPopup title={popupTitle} message={popupMessage} setShowPopup={setShowPopup} />}

                            <div className="profile">
                                <div className="profile-picture">
                                    <img src={data.user.user_avatar_url || defaultProfilePicture} onError={e => { e.currentTarget.src = defaultProfilePicture; e.currentTarget.onerror = null }} crossOrigin="Anonymous" draggable="false" alt="" id="profile-picture" />
                                </div>
                                <div className="profile-info">
                                    <div className="profile-name">
                                        <p>{data.user.user_name}</p>
                                        <span>#{data.user.user_tag}</span>
                                    </div>
                                    <div className="profile-email">{data.user.user_email}</div>

                                    <div className="profile-bio">
                                        <div className="profile-permission-level">
                                            <FcServices />
                                            <span className="darker">Role: </span>{userRole}
                                        </div>

                                        <div className="created-at">
                                            <FcPlus />
                                            <span className="darker">Created at: </span>{new Date(data.user.user_created_at.date).toLocaleDateString() + ", " + new Date(data.user.user_created_at.date).toLocaleTimeString()}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="profile-bottom">

                                <div className="box-wrapper">
                                    <div className="settings-wrapper">

                                        <div className="box" id="username">
                                            <h2>Settings</h2>

                                            <div className="user-info">
                                                <div className="data-wrapper">
                                                    <input autoComplete="new-password" type="text" onChange={(e) => {
                                                        // validate email
                                                        e.currentTarget.value = isUsernameValid(e.currentTarget.value).value;

                                                        // when typing, remove error class
                                                        if (e.currentTarget.classList.contains("error")) {
                                                            e.currentTarget.classList.remove("error");
                                                        }

                                                    }} onBlur={(e) => {
                                                        // validate email
                                                        e.currentTarget.value = isInputValidShowErrors(e, "username");

                                                        // check if user name has changed
                                                        setCanSaveSettings(isUpdateValid(data.user).status);

                                                    }} placeholder={data.user.user_name} className="user-name-settings" minLength={4} maxLength={32} />

                                                    <div className="vertical-divider"></div>

                                                    <HiOutlineHashtag className="tag" />

                                                    <input autoComplete="new-password" type="text" onChange={(e) => {
                                                        // validate tag
                                                        e.currentTarget.value = isTagValid(e.currentTarget.value).value;

                                                    }} onBlur={(e) => {
                                                        // validate tag
                                                        e.currentTarget.value = addPaddingToStringNumber(e.currentTarget.value, 4);

                                                        // check if user tag has changed
                                                        setCanSaveSettings(isUpdateValid(data.user).status);

                                                    }} placeholder={data.user.user_tag} className="user-tag-settings" min={1} max={9999} maxLength={4} />

                                                </div>
                                                <div className="data-wrapper">
                                                    <MdOutlineAlternateEmail className="email" />

                                                    <div className="vertical-divider"></div>

                                                    <input autoComplete="new-password" type="email" onChange={(e) => {
                                                        // when typing, remove error class
                                                        if (e.currentTarget.classList.contains("error")) {
                                                            e.currentTarget.classList.remove("error");
                                                        }

                                                    }} onBlur={e => {
                                                        // validate email
                                                        e.currentTarget.value = isInputValidShowErrors(e, "email");

                                                        // check if user tag has changed
                                                        setCanSaveSettings(isUpdateValid(data.user).status);

                                                    }} placeholder={data.user.user_email} className="user-email-settings" minLength={4} maxLength={255} />

                                                </div>
                                            </div>

                                        </div>

                                        <div className="box" id="save">
                                            <div className={`settings-submit-button ${canSaveSettings ? "" : "disabled"}`} onClick={() => submitUserSettings(data.user)}>
                                                <p>Save</p>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="settings-wrapper">
                                        <div className="box" id="password">
                                            <h2>Change Password</h2>
                                            <div className="user-info">
                                                <div className="data-wrapper">
                                                    <MdOutlineLock className="password" />

                                                    <div className="vertical-divider"></div>

                                                    <input autoComplete="new-password" type="password" onChange={(e) => {
                                                        e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                                                    }} placeholder="Old Password" onBlur={e => {
                                                        setCanSavePassword(isPasswordUpdateValid(data.user).status);

                                                    }} className="user-password-settings" id="user-old-password-settings" minLength={8} maxLength={255} />
                                                </div>

                                                <div className="data-wrapper">
                                                    <MdOutlineLock className="password" />

                                                    <div className="vertical-divider"></div>

                                                    <input autoComplete="new-password" type="password" onChange={(e) => {
                                                        e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                                                    }} onBlur={e => {
                                                        // check if passwords match
                                                        isInputValidShowErrors(e, "password");

                                                        setCanSavePassword(isPasswordUpdateValid(data.user).status);
                                                    }} placeholder="New Password" className="user-password-settings" id="user-new-password-settings" minLength={8} maxLength={255} />
                                                </div>

                                                <div className="data-wrapper">
                                                    <MdOutlineLock className="password" />

                                                    <div className="vertical-divider"></div>

                                                    <input autoComplete="new-password" type="password" onChange={(e) => {
                                                        e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                                                    }} onBlur={e => {
                                                        // check if passwords match
                                                        isInputValidShowErrors(e, "password");

                                                        setCanSavePassword(isPasswordUpdateValid(data.user).status);
                                                    }} placeholder="Repeat New Password" className="user-password-settings" id="user-new-password-confirm-settings" minLength={8} maxLength={255} />
                                                </div>


                                            </div>
                                        </div>

                                        <div className="box" id="save-password">
                                            <div className={`settings-submit-button ${canSavePassword ? "" : "disabled"}`} onClick={() => submitUserSettings(data.user, "password")}>
                                                <p>Save</p>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>

                        </div>

                    ) :
                    <div className="loading-container">
                        <div className="loader"></div>
                    </div>
            }
        </div>
    );
}

export default Profile;
