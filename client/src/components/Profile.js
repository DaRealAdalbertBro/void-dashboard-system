import { useNavigate } from "react-router-dom";
import useFetch from "./useFetch";
import { useEffect, useState } from "react";
import { FcPlus, FcServices } from "react-icons/fc";
import { HiOutlineHashtag } from "react-icons/hi";
import { MdOutlineAlternateEmail, MdOutlineLock } from "react-icons/md";
import Axios from "axios";
import { defaultProfilePicture, allowSpecialCharactersInUsername } from './globalVariables';

import "../css/Profile.css";

const validateUsernameSettings = (event) => {
    const value = event.currentTarget.value;

    // look for special characters if enabled
    if (!allowSpecialCharactersInUsername) {
        const regex = /^[0-9a-zA-Z_.-]+$/;
        if (!regex.test(value)) {
            return event.currentTarget.value = value.slice(0, -1);
        }

        if ((value[value.length - 1] == '.' && value[value.length - 2] == '.' && value[value.length - 3] == '.')
            || (value[value.length - 1] == '-' && value[value.length - 2] == '-' && value[value.length - 3] == '-')
            || (value[value.length - 1] == '_' && value[value.length - 2] == '_' && value[value.length - 3] == '_')) {
            return event.currentTarget.value = value.slice(0, -1);
        }
    }

    // check length
    if (value.length > 32) {
        return event.currentTarget.value = value.slice(0, 32);
    }

    return event.currentTarget.value = value;
}

const validatePasswordSettings = (event) => {
    const value = event.currentTarget.value;

    if (value.length > 255) {
        return event.currentTarget.value = value.slice(0, 255);
    }

    return event.currentTarget.value = value;
}

const validateTagSettings = (event) => {
    const value = event.currentTarget.value;
    if (!isNumberOnly(value)) {
        return event.currentTarget.value = value.slice(0, -1);
    }

    if (value.length > 4) {
        return event.currentTarget.value = value.slice(0, 4);
    }

    return event.currentTarget.value = value;
}

const addPaddingToTag = (event) => {
    const value = event.currentTarget.value;
    if (value.length === 0) return;

    if (value.length < 4) {
        return event.currentTarget.value = value.padStart(4, "0");
    }

    if (value.length > 4) {
        return event.currentTarget.value = value.slice(0, 4);
    }

    return event.currentTarget.value = value;
}

const isNumberOnly = (string) => {
    const regex = /^[0-9]+$/;
    return regex.test(string);
}

function isEmail(email) {
    email = email.currentTarget.value;
    if (email.length === 0) return true;
    const regex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
    return regex.test(email);
}

const validateEmailSettings = (event) => {
    const value = event.currentTarget.value;

    if (event.currentTarget.classList.contains("error")) {
        event.currentTarget.classList.remove("error");
    }

    if (value.length > 255) {
        return event.currentTarget.value = value.slice(0, 255);
    }

    return event.currentTarget.value = value;
}

const submitUserSettings = () => {
    const user_name = document.querySelector(".user-name-settings").value;
    const user_tag = document.querySelector(".user-tag-settings").value;
    const user_email = document.querySelector(".user-email-settings").value;

    let updateObject = {};

    if (user_name.length > 0) {
        updateObject.user_name = user_name;
    }

    if (user_tag.length > 0 && isNumberOnly(user_tag)) {
        updateObject.user_tag = user_tag;
    }

    if (user_email.length > 0) {
        updateObject.user_email = user_email;
    }

    if (Object.keys(updateObject).length === 0) {
        return;
    }


    Axios.post("/api/post/updateuser", updateObject)
        .then((response) => {
            if (response.data.status) {
                window.location.reload();
            }
        })
        .catch((error) => {
            console.log(error);
        })

}

// get average color of profile picture
function getAverageColor(imageElement, ratio) {
    const canvas = document.createElement("canvas")

    let height = canvas.height = imageElement.naturalHeight
    let width = canvas.width = imageElement.naturalWidth

    const context = canvas.getContext("2d")
    context.drawImage(imageElement, 0, 0)

    let data, length
    let i = -4;
    let count = 0;


    try {
        data = context.getImageData(0, 0, width, height)
        length = data.data.length


    } catch (err) {
        return {
            R: 0,
            G: 0,
            B: 0
        }
    }
    let R, G, B
    R = G = B = 0

    while ((i += ratio * 4) < length) {
        ++count;

        R += data.data[i]
        G += data.data[i + 1]
        B += data.data[i + 2]
    }

    R = ~~(R / count)
    G = ~~(G / count)
    B = ~~(B / count)

    return {
        R,
        G,
        B
    }
}

const Profile = () => {
    const navigate = useNavigate();

    const { data, isPending, error } = useFetch("/api/get/userinfo");
    const [userRole, setUserRole] = useState("User");


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

        return (() => {
            if (profilePicture) {
                profilePicture.onload = null;
            }
        })

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
                                    <div className="box" id="username">
                                        <h2>Settings</h2>

                                        <div className="user-info">
                                            <div className="data-wrapper">
                                                <input autoComplete="new-password" type="text" onChange={(e) => validateUsernameSettings(e)} placeholder={data.user.user_name} className="user-name-settings" maxLength={32} />

                                                <div className="vertical-divider"></div>

                                                <HiOutlineHashtag className="tag" />
                                                <input autoComplete="new-password" type="text" onBlur={(e) => addPaddingToTag(e)} onChange={(e) => validateTagSettings(e)} placeholder={data.user.user_tag} className="user-tag-settings" min={1} max={9999} maxLength={4} />
                                            </div>
                                            <div className="data-wrapper">
                                                <MdOutlineAlternateEmail className="email" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="email" onBlur={e => {
                                                    if (!isEmail(e)) {
                                                        e.currentTarget.classList.add("error");
                                                    } else {
                                                        e.currentTarget.classList.remove("error");
                                                    }
                                                }} onChange={(e) => {
                                                    validateEmailSettings(e)
                                                }
                                                } placeholder={data.user.user_email} className="user-email-settings" maxLength={255} />
                                            </div>
                                        </div>

                                        <div className="settings-submit-button" onClick={() => submitUserSettings()}>
                                            <p>Save</p>
                                        </div>

                                    </div>

                                    <div className="box" id="password">
                                        <h2>Change Password</h2>
                                        <div className="user-info">
                                            <div className="data-wrapper">
                                                <MdOutlineLock className="password" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="password" onChange={(e) => validatePasswordSettings(e)} placeholder="Old Password" className="user-password-settings" id="old-password" maxLength={255} />
                                            </div>

                                            <div className="data-wrapper">
                                                <MdOutlineLock className="password" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="password" onChange={(e) => validatePasswordSettings(e)} placeholder="New Password" className="user-password-settings" id="new-password" maxLength={255} />
                                            </div>

                                            <div className="data-wrapper">
                                                <MdOutlineLock className="password" />

                                                <div className="vertical-divider"></div>

                                                <input autoComplete="new-password" type="password" onChange={(e) => validatePasswordSettings(e)} placeholder="Repeat New Password" className="user-password-settings" id="retype-new-password" maxLength={255} />
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
