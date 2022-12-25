//import { useNavigate } from "react-router-dom";
import useFetch from "./useFetch";
import { useEffect, useState } from "react";
import { FcPlus, FcServices } from "react-icons/fc";
import { HiOutlineHashtag } from "react-icons/hi";
import { MdOutlineAlternateEmail, MdOutlineLock } from "react-icons/md";
import { AiOutlineUpload } from "react-icons/ai";
import Axios from "axios";
import { defaultProfilePicture } from './globalVariables';

import { isUsernameValid, isTagValid, isPasswordValid, isUpdateValid, isFileUpdateValid, isPasswordUpdateValid, isFileValid, isInputValidShowErrors } from "../utils/validateInput";

import "../css/Profile.css";
import { addPaddingToStringNumber, getAverageColor, averageColorToGradient } from "../utils/utils";

import { CustomPopup } from "./CustomPopup";

const Profile = () => {
    //const navigate = useNavigate();

    let { data, isPending, error } = useFetch("/api/get/userinfo");
    const [userRole, setUserRole] = useState("User");
    const [canSaveSettings, setCanSaveSettings] = useState(false);
    const [canSavePassword, setCanSavePassword] = useState(false);
    const [canSaveAvatar, setCanSaveAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("Warning");
    const [popupMessage, setPopupMessage] = useState("Something went wrong... Try again later!");

    const submitUserSettings = async (data, type = "userinfo") => {

        // check if settings can be saved
        if ((type === "userinfo" && !canSaveSettings)
            || (type === "password" && !canSavePassword)
            || (type === "avatar" && !canSaveAvatar)) {
            return false;
        }

        let updateValid;

        if (type === "userinfo") {
            updateValid = await isUpdateValid(data);
        } else if (type === "password") {
            updateValid = await isPasswordUpdateValid(data);
        } else if (type === "avatar") {
            updateValid = await isFileUpdateValid(data, avatarFile).then((response) => {
                return response;
            }).catch((error) => {
                return error;
            });
        }

        if (await !updateValid.status) {
            setShowPopup(true);
            setPopupTitle("Warning");
            setPopupMessage("Something went wrong... Try again later! Could not update user info!");
            return false;
        }
        
        Axios.post("http://localhost:3001/api/post/updateuser", updateValid.value, { headers: { ...updateValid.headers } })
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
                // show error popup
                setShowPopup(true);
                setPopupTitle("Error");
                setPopupMessage("Something went wrong... Try again later!");
            })

        if (type === "userinfo") {
            setCanSaveSettings(false);
        } else if (type === "password") {
            setCanSavePassword(false);
        }
        else if (type === "avatar") {
            setCanSaveAvatar(false);
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
        }

        // get dominant color of profile picture
        const avatarElement = document.getElementById("profile-picture");
        if (!avatarElement) return;

        avatarElement.onload = () => {
            const banner = document.querySelector(".profile-container .profile");

            if (data && data.user
                && (data.user.user_banner_color == null || data.user.user_banner_color === "[90,113,147]")
                && data.user.user_avatar_url !== defaultProfilePicture) {
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
                                            <div className="box-header">
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

                                                    <div className={`settings-submit-button ${canSaveSettings ? "" : "disabled"}`} onClick={() => submitUserSettings(data.user)}>
                                                        <p>Save</p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>


                                        <div className="box" id="avatar">
                                            <div className="box-header">
                                                <h2>Change Avatar</h2>
                                                <div className="user-info">

                                                    <div className="avatar-wrapper">
                                                        <div className="avatar-upload">
                                                            <label htmlFor="avatar-upload">
                                                                <input type="file" id="avatar-upload" onChange={e => {
                                                                    // check if file is valid
                                                                    if (isFileValid(e.currentTarget.files[0]).status) {
                                                                        // allow save button
                                                                        setCanSaveAvatar(true);

                                                                        // set preview
                                                                        setAvatarPreview(URL.createObjectURL(e.currentTarget.files[0]));
                                                                        setAvatarFile(e.currentTarget.files[0]);
                                                                    } else {
                                                                        // disable save button
                                                                        setCanSaveAvatar(false);
                                                                    }
                                                                }} />
                                                                <div className="avatar-upload-button">

                                                                    <div className="avatar-upload-icon">
                                                                        <AiOutlineUpload />
                                                                    </div>


                                                                    <p>Upload</p>
                                                                </div>
                                                            </label>

                                                        </div>

                                                        <div className="avatar-preview">
                                                            <div className="avatar-preview-image">
                                                                <img src={avatarPreview || data.user.user_avatar_url || defaultProfilePicture} onError={e => { e.currentTarget.src = defaultProfilePicture; e.currentTarget.onerror = null }} crossOrigin="Anonymous" draggable="false" alt="" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="submit-wrapper">
                                                        <div className={`settings-submit-button ${canSaveAvatar ? "" : "disabled"}`} onClick={() => submitUserSettings(data.user, "avatar")}>
                                                            <p>Save</p>
                                                        </div>

                                                        <div className="settings-submit-button" style={{ backgroundColor: "var(--blue)" }} onClick={async () => {
                                                            // convert default profile picture to base64
                                                            let url = defaultProfilePicture;
                                                            const newAvatarUrl = await fetch(url)
                                                                .then(response => response.blob())
                                                                .then(blob => blob && new File([blob], "default.webp", { type: "image/webp" }));

                                                            // // set preview
                                                            setAvatarPreview(newAvatarUrl);
                                                            setAvatarFile(newAvatarUrl);

                                                            // disable save button
                                                            setCanSaveAvatar(true);
                                                        }}>
                                                            <p>Restore</p>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                    <div className="settings-wrapper">
                                        <div className="box" id="password">
                                            <div className="box-header">
                                                <h2>Change Password</h2>
                                                <div className="user-info">
                                                    <div className="data-wrapper">
                                                        <MdOutlineLock className="password" />

                                                        <div className="vertical-divider"></div>

                                                        <input autoComplete="new-password" type="password" onChange={(e) => {

                                                            // remove error when typing
                                                            if (e.currentTarget.classList.contains("error")) {
                                                                e.currentTarget.classList.remove("error");
                                                            }
                                                        }} placeholder="Old Password" onBlur={e => {
                                                            // validate password
                                                            e.currentTarget.value = isInputValidShowErrors(e, "password");

                                                            // check if can save
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
                                                            isInputValidShowErrors(e, "password_match");

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
                                                            isInputValidShowErrors(e, "password_match");

                                                            setCanSavePassword(isPasswordUpdateValid(data.user).status);
                                                        }} placeholder="Repeat New Password" className="user-password-settings" id="user-new-password-confirm-settings" minLength={8} maxLength={255} />
                                                    </div>

                                                    <div className={`settings-submit-button ${canSavePassword ? "" : "disabled"}`} onClick={() => submitUserSettings(data.user, "password")}>
                                                        <p>Change</p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div >

                        </div >

                    ) :
                    <div className="loading-container">
                        <div className="loader"></div>
                    </div>
            }
        </div >
    );
}

export default Profile;
