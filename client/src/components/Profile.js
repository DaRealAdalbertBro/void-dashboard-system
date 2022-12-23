import { useNavigate, use } from "react-router-dom";
import useFetch from "./useFetch";
import { useEffect, useState } from "react";
import { FcPlus, FcServices } from "react-icons/fc";
import { HiOutlineHashtag } from "react-icons/hi";
import { MdOutlineAlternateEmail, MdOutlineLock } from "react-icons/md";
import Axios from "axios";
import { defaultProfilePicture } from './globalVariables';

import { isUsernameValid, isTagValid, isPasswordValid, isUpdateValid, isInputValidShowErrors } from "../utils/validateInput";

import "../css/Profile.css";
import { addPaddingToStringNumber, getAverageColor } from "../utils/utils";

const Profile = () => {
    const navigate = useNavigate();

    let { data, isPending, error } = useFetch("/api/get/userinfo");
    const [userRole, setUserRole] = useState("User");
    const [canSaveSettings, setCanSaveSettings] = useState(false);

    const submitUserSettings = (data) => {
        const updateValid = isUpdateValid(data);
        if (!updateValid.status) {
            return false;
        }

        Axios.post("http://localhost:3001/api/post/updateuser", updateValid.value)
            .then((response) => {
                // if update was successful
                if (response.data.status) {

                    // update data with new user info
                    data.user = response.data.user;

                    // disable save button
                    setCanSaveSettings(false);

                    // reload page
                    window.location.replace("/dashboard/profile");
                }
            })
            .catch((error) => {
                console.log(error);
            })

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
        const profilePicture = document.getElementById("profile-picture");
        if (!profilePicture) return;

        profilePicture.onload = () => {
            const averageColor = getAverageColor(profilePicture, 1);

            const rgb = `${averageColor.R}, ${averageColor.G}, ${averageColor.B}`;
            let baseIncrement = 10;
            let baseDecrement = 15;
            let decrementR = averageColor.R > 125 ? -baseDecrement : baseIncrement;
            let decrementG = averageColor.G > 125 ? -baseDecrement : baseIncrement;
            let decrementB = averageColor.B > 125 ? -baseDecrement : baseIncrement;

            const rgb2 = `${averageColor.R + decrementR}, ${averageColor.G + decrementG}, ${averageColor.B + decrementB}`;
            document.querySelector(".profile-container .profile").style.backgroundImage = `linear-gradient(to bottom, rgba(${rgb}, 1), rgba(${rgb2}, 0.7), rgba(${rgb2}, 0.7))`;
        }


    }, [data]);


    return (
        <div className="profile-container">
            {error && <div>{error}</div>}
            {
                (data && data.user)
                    ? (
                        <div className="profile-container">
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
                                            Role: <span className="darker">{userRole}</span>
                                        </div>

                                        <div className="created-at">
                                            <FcPlus />
                                            Created at: <span className="darker">{new Date(data.user.user_created_at.date).toLocaleDateString() + ", " + new Date(data.user.user_created_at.date).toLocaleTimeString()}</span>
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

                                    <div className="box" id="password">
                                        <h2>Change Password</h2>
                                        <div className="user-info">
                                            <div className="data-wrapper">
                                                <MdOutlineLock className="password" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="password" onChange={(e) => {
                                                    e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                                                }} placeholder="Old Password" className="user-password-settings" id="old-password" minLength={8} maxLength={255} />
                                            </div>

                                            <div className="data-wrapper">
                                                <MdOutlineLock className="password" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="password" onChange={(e) => {
                                                    e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                                                }} placeholder="New Password" className="user-password-settings" id="new-password" minLength={8} maxLength={255} />
                                            </div>

                                            <div className="data-wrapper">
                                                <MdOutlineLock className="password" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="password" onChange={(e) => {
                                                    e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;
                                                }} placeholder="Repeat New Password" className="user-password-settings" id="retype-new-password" minLength={8} maxLength={255} />
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
