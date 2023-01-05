import Axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// import react icons
import { FcPlus, FcServices } from "react-icons/fc";
import { HiOutlineHashtag } from "react-icons/hi";
import { MdOutlineAlternateEmail, MdOutlineLock } from "react-icons/md";
import { AiOutlineUpload } from "react-icons/ai";
import { BsShieldLock } from "react-icons/bs";
import { BiKey } from "react-icons/bi";

// import default profile picture
import { defaultProfilePicture, maxPermissionLevel } from '../globalVariables';

// import css
import "./Profile.css";

// import utils
import { isUsernameValid, isTagValid, isPasswordValid, isFileValid, isInputValidShowErrors, isPermissionLevelValid } from "../../utils/validateInput";
import { isUpdateValid, isPasswordUpdateValid, submitSettings, deleteAccount, isTransferUpdateValid, transferOwnership } from "./profileMethods";
import { addPaddingToStringNumber, getAverageColor, averageColorToGradient, permissionLevelToString } from "../../utils/utils";

// import components
import { LoadingCircle } from "../LoadingCircle";
import { CustomPopup } from "../CustomPopup";

const Profile = () => {
    // get user_id parameter from url
    const { userID } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);

    // set variables for updating user info - save buttons
    const [canSaveSettings, setCanSaveSettings] = useState(false);
    const [canSavePassword, setCanSavePassword] = useState(false);
    const [canSaveAvatar, setCanSaveAvatar] = useState(false);

    // store avatar file for later use
    const [avatarFile, setAvatarFile] = useState(null);

    // set popup variables
    const [popupActive, setPopupActive] = useState(false);
    const [popupTitle, setPopupTitle] = useState("Warning");
    const [popupMessage, setPopupMessage] = useState("Something went wrong... Try again later!");

    // declare popup context
    // this is used to pass popup variables to other components
    const popupContext = {
        active: [popupActive, setPopupActive],
        title: [popupTitle, setPopupTitle],
        message: [popupMessage, setPopupMessage],
    };

    // get user data from server
    useEffect(() => {
        // define abort controller to abort fetch request if user leaves page
        const controller = new AbortController();

        // get user data from server
        Axios.post("http://localhost:3001/api/post/userById", {
            user_id: userID
        }, {
            signal: controller.signal
        }).then((response) => {
            if (response.data.status) {
                return setData(response.data);
            }

            // if user doesn't exist, redirect to 404 page
            return navigate("/404");
        }).catch((error) => {
            if (error.name === "CanceledError") return;

            // if user doesn't exist or some other error occurred, redirect to 404 page
            return navigate("/404");
        });

        // abort fetch request if user leaves page
        return () => {
            controller.abort();
        };
    }, [navigate, userID]);

    // set document title along with the banner color
    useEffect(() => {
        document.title = "Profile | Void";

        // get dominant color of profile picture
        const avatarElement = document.getElementById("profile-picture");
        if (!avatarElement) return;

        // define abort controller to abort fetch request if user leaves page
        const controller = new AbortController();

        // set banner color to user's banner color
        avatarElement.onload = () => {
            // get banner element
            const banner = document.querySelector(".profile-container .profile");

            // if user doesn't have a banner color in database, get average color of avatar and set it as background
            if (data.user
                && (!data.user.user_banner_color || data.user.user_banner_color === "[90,113,147]")
                && data.user.user_avatar_url !== defaultProfilePicture) {

                // get average color of avatar
                const averageColor = getAverageColor(avatarElement, 1);

                // create gradient from this color and set it as background
                const gradient = averageColorToGradient([averageColor.R, averageColor.G, averageColor.B]);
                banner.style.background = gradient;

                // store this color in database
                Axios.post("http://localhost:3001/api/post/updateuser",
                    {
                        user_id: data.user.user_id,
                        user_banner_color: `[${averageColor.R},${averageColor.G},${averageColor.B}]`,
                    }, {
                    signal: controller.signal
                }).then((response) => {
                    // if update was successful
                    if (response.data.status) {
                        // update data with new user info
                        setData(response.data);
                    }
                }).catch(error => error);
                // end of axios post

                console.log("Axios post request sent to update user banner color.")
            }
            else {
                // set banner color to user's banner color if it's already in database
                const averageColor = JSON.parse(data.user.user_banner_color);
                const gradient = averageColorToGradient(averageColor);
                banner.style.backgroundImage = gradient;
            }
        } // end of avatarElement.onload
    }, [data]);


    return (
        <div className="profile-container">
            {popupActive && <CustomPopup title={popupTitle} message={popupMessage} setActive={setPopupActive} />}

            {
                (data && data.user)
                    ? (
                        <div className="profile-container">

                            <ProfileTop data={data} />

                            <div className="profile-bottom">

                                {data.canEditProfile ? (
                                    <div className="box-wrapper">
                                        <div className="settings-wrapper">

                                            <UserSettings data={data} popupContext={popupContext} canSaveSettings={canSaveSettings} setCanSaveSettings={setCanSaveSettings} setCanSavePassword={setCanSavePassword} canSavePassword={canSavePassword} />

                                        </div>

                                        <div className="settings-wrapper">
                                            <AvatarSettings data={data} popupContext={popupContext} canSaveAvatar={canSaveAvatar} setCanSaveAvatar={setCanSaveAvatar} avatarFile={avatarFile} setAvatarFile={setAvatarFile} />

                                            <DeleteAccountSettings data={data} popupContext={popupContext} />
                                        </div>


                                    </div>
                                ) : <div className="box-wrapper">
                                    {/* IF USER CANT EDIT THE PROFILE, DO WHATEVER HERE */}
                                    <div className="box">
                                        <div className="box-header">
                                            <h3 className="box-title">You don't have enough permissions to edit this user :C</h3>
                                        </div>
                                    </div>

                                </div>
                                }
                            </div >

                        </div >

                    ) : <LoadingCircle />
            }
        </div >
    );
}

const ProfileTop = ({ data }) => {
    return (
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
                        <span className="darker">Role: </span>{permissionLevelToString(data.user.user_permissions)}
                    </div>

                    <div className="created-at">
                        <FcPlus />
                        <span className="darker">Created at: </span>{new Date(data.user.user_created_at.date).toLocaleDateString() + ", " + new Date(data.user.user_created_at.date).toLocaleTimeString()}
                    </div>

                </div>
            </div>
        </div>
    );
};

const UserSettings = ({ data, popupContext, canSaveSettings, setCanSaveSettings, setCanSavePassword, canSavePassword }) => {
    return (
        <div className="box" id="username">
            <div className="box-header">
                <h2>Account</h2>

                <div className="user-info">
                    <h3>Name and Tag</h3>
                    <div className="data-wrapper">
                        <input autoComplete="new-password" type="text" onChange={(e) => {
                            // validate email
                            e.currentTarget.value = isUsernameValid(e.currentTarget.value).value;

                            // when typing, remove error class
                            if (e.currentTarget.classList.contains("error")) {
                                e.currentTarget.classList.remove("error");
                            }

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

                    <h3>Change Email</h3>

                    <div className="data-wrapper">
                        <MdOutlineAlternateEmail className="email" />

                        <div className="vertical-divider"></div>

                        <input autoComplete="new-password" type="email" onChange={(e) => {
                            // when typing, remove error class
                            if (e.currentTarget.classList.contains("error")) {
                                e.currentTarget.classList.remove("error");
                            }

                            // validate email
                            e.currentTarget.value = isInputValidShowErrors(e, "email");

                            // check if user tag has changed
                            setCanSaveSettings(isUpdateValid(data.user).status);

                        }} placeholder={data.user.user_email} className="user-email-settings" minLength={4} maxLength={255} />

                    </div>

                    {data.isAdmin ? (
                        <div className="flex flex-column full">
                            <h3>Permission Level</h3>

                            <div className="data-wrapper">
                                <BiKey className="permissions" />

                                <div className="vertical-divider"></div>

                                <input autoComplete="new-password" style={{ width: "100%" }} type="text" onChange={(e) => {
                                    e.currentTarget.value = isPermissionLevelValid(e.currentTarget.value).value;

                                    setCanSaveSettings(isUpdateValid(data.user).status);

                                }} placeholder={`${data.user.user_permissions} (${permissionLevelToString(data.user.user_permissions)})`} className="user-permissions-settings" max={maxPermissionLevel} min={0} maxLength={maxPermissionLevel.toString().length} />

                            </div>
                        </div>
                    ) : null}

                    <button className="settings-submit-button" disabled={!canSaveSettings} onClick={() => {
                        submitSettings(data, {
                            type: "userinfo",
                            canSave: [canSaveSettings, setCanSaveSettings],
                            popupContext
                        })
                    }}>
                        <p>Save</p>
                    </button>

                </div>

                {/* PASSWORD CHANGE */}

                <h2>Change Password</h2>
                <div className="user-info">

                    {!data.isAdmin && <h3>Old password</h3>}
                    {!data.isAdmin &&
                        <div className="data-wrapper">
                            <MdOutlineLock className="password" />

                            <div className="vertical-divider"></div>

                            <input autoComplete="new-password" type="password" onChange={(e) => {

                                // remove error when typing
                                if (e.currentTarget.classList.contains("error")) {
                                    e.currentTarget.classList.remove("error");
                                }
                            }} onBlur={e => {
                                // validate password
                                e.currentTarget.value = isInputValidShowErrors(e, "password");

                                // check if can save
                                setCanSavePassword(isPasswordUpdateValid(data.user, data.isAdmin).status);

                            }} className="user-password-settings" id="user-old-password-settings" minLength={8} maxLength={255} />
                        </div>
                    }

                    <h3>New password</h3>
                    <div className="data-wrapper">
                        <BsShieldLock className="password" />

                        <div className="vertical-divider"></div>

                        <input autoComplete="new-password" type="password" onChange={(e) => {
                            e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;

                            // check if passwords match
                            isInputValidShowErrors(e, "password_match");

                            // check if can save
                            setCanSavePassword(isPasswordUpdateValid(data.user, data.isAdmin).status);

                        }} className="user-password-settings" id="user-new-password-settings" minLength={8} maxLength={255} />
                    </div>

                    <h3>Confirm new password</h3>
                    <div className="data-wrapper">
                        <BsShieldLock className="password" />

                        <div className="vertical-divider"></div>

                        <input autoComplete="new-password" type="password" onChange={(e) => {
                            e.currentTarget.value = isPasswordValid(e.currentTarget.value).value;

                            // check if passwords match
                            isInputValidShowErrors(e, "password_match");

                            // check if can save
                            setCanSavePassword(isPasswordUpdateValid(data.user, data.isAdmin).status);
                        }} className="user-password-settings" id="user-new-password-confirm-settings" minLength={8} maxLength={255} />
                    </div>

                    <button className="settings-submit-button" disabled={!canSavePassword} onClick={() => {
                        submitSettings(data, {
                            type: "password",
                            canSave: [canSavePassword, setCanSavePassword],
                            popupContext
                        })
                    }}>
                        <p>Change</p>
                    </button>

                </div>
            </div>
        </div>
    );
};

const AvatarSettings = ({ data, popupContext, canSaveAvatar, setCanSaveAvatar, avatarFile, setAvatarFile }) => {
    return (
        <div className="box" id="avatar">
            <div className="box-header">
                <h2>Avatar Settings</h2>
                <div className="user-info">

                    <div className="avatar-wrapper">

                        <div className="avatar-upload">
                            <label htmlFor="avatar-upload">
                                <input type="file" id="avatar-upload" onChange={e => {
                                    // check if file is valid
                                    if (isFileValid(e.currentTarget.files[0]).status) {
                                        // allow save button
                                        setCanSaveAvatar(true);

                                        // revoke old file
                                        URL.revokeObjectURL(avatarFile);

                                        // set new file
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
                                <img src={(avatarFile && URL.createObjectURL(avatarFile)) || data.user.user_avatar_url || defaultProfilePicture} onError={e => { e.currentTarget.src = defaultProfilePicture; e.currentTarget.onerror = null }} crossOrigin="Anonymous" draggable="false" alt="" />
                            </div>
                        </div>
                    </div>

                    <p className="description">The maximum file size is 8 MB, almost all image and gif formats are allowed.</p>

                    <div className="submit-wrapper">
                        <button className="settings-submit-button" disabled={!canSaveAvatar} onClick={() => {
                            submitSettings(data, {
                                type: "avatar",
                                avatarFile: avatarFile,
                                canSave: [canSaveAvatar, setCanSaveAvatar],
                                popupContext
                            })
                        }}>
                            <p>Save</p>
                        </button>

                        <button className="settings-submit-button blue" onClick={async () => {
                            // convert default profile picture to base64
                            let url = defaultProfilePicture;
                            const newAvatarUrl = await fetch(url)
                                .then(response => response.blob())
                                .then(blob => blob && new File([blob], "default.webp", { type: "image/webp" }));

                            // // set preview
                            setAvatarFile(newAvatarUrl);

                            // disable save button
                            setCanSaveAvatar(true);
                        }}>
                            <p>Restore</p>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const DeleteAccountSettings = ({ data, popupContext }) => {
    const navigate = useNavigate();

    const [canBeTransferred, setCanBeTransferred] = useState(false);
    const [canBeDeleted, setCanBeDeleted] = useState(false);

    return (
        <div className="box" id="delete-account">
            <div className="box-header">
                <h2 className="red">Delete Account</h2>

                {data.user.user_permissions > maxPermissionLevel ? (
                    <p className="account-delete-warning">You cannot delete this account because you have the highest permission (owner). If you still want to delete it, transfer ownership!</p>
                ) : <p className="account-delete-warning">This action is irreversible. If you continue, all your data will be deleted.</p>}

                <div className="user-info" style={data.user.user_permissions > maxPermissionLevel ? { opacity: 0.4, pointerEvents: "none", userSelect: "none" } : {}}>
                    <h3>Type "<span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--green-hover)", userSelect: "none" }}>I want to delete this account</span>" below to confirm:</h3>

                    <div className="data-wrapper">
                        <input autoComplete="new-password" type="text" onChange={(e) => {
                            if (e.target.value === "I want to delete this account") {
                                setCanBeDeleted(true);
                            }
                            else {
                                setCanBeDeleted(false);
                            }
                        }} />
                    </div>

                    <button className="settings-submit-button red" id="delete-account-button" disabled={!canBeDeleted} onClick={() => {
                        deleteAccount(data.user, popupContext, navigate);
                    }}>
                        <p>Delete Account</p>
                    </button>

                </div>

                {data.user.user_permissions > maxPermissionLevel && <h2 className="red">Transfer Ownership</h2>}

                {data.user.user_permissions > maxPermissionLevel ? (
                    <div className="user-info">
                        <h3>Transfer ownership to (User ID):</h3>

                        <div className="data-wrapper">
                            <input autoComplete="new-password" type="text" id="user-id-transfer" onChange={(e) => {
                                // check if input is number
                                e.target.value = e.target.value.replace(/\D/g, '');

                                setCanBeTransferred(isTransferUpdateValid(data.user).status);

                            }} />
                        </div>

                        <h3>Type "<span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--green-hover)", userSelect: "none" }}>I want to transfer ownership</span>" below to confirm:</h3>

                        <div className="data-wrapper">
                            <input autoComplete="new-password" type="text" id="transfer-confirm" onChange={(e) => {
                                setCanBeTransferred(isTransferUpdateValid(data.user).status);
                            }} />
                        </div>

                        <button className="settings-submit-button red" id="transfer-ownership-button" disabled={!canBeTransferred} onClick={() => {
                            transferOwnership(data.user, popupContext);
                        }}>
                            <p>Transfer Ownership</p>
                        </button>


                    </div>

                ) : null}
            </div>

        </div>
    );
};

export default Profile;