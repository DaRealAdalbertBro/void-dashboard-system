import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { BiGroup } from "react-icons/bi";
import { FaBars, FaHome, FaUserAlt } from "react-icons/fa";
import { BsBoxArrowLeft } from "react-icons/bs";
import { MdArrowDropDown } from "react-icons/md";

import { defaultProfilePicture } from './globalVariables';

import '../css/Dashboard.css';

Axios.defaults.withCredentials = true;

const Dashboard = ({ componentToShow }) => {
    const navigate = useNavigate();
    const [response, setResponse] = useState({});
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [permissionLevel, setPermissionLevel] = useState(0);
    const [profilePicture, setProfilePicture] = useState("");
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        Axios.post('http://localhost:3001/api/post/logout').then((response) => {
            if (response.data.status) {
                return navigate('/');
            }
        });
    }

    const handleClickOutsideProfileDropdown = (e) => {
        if (profileDropdownOpen && !e.target.closest('.profile')) {
            handleProfileDropdown();
        }
    }

    const handleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    }

    const handleProfileDropdownClick = (destination) => {
        setProfileDropdownOpen(false);

        // navigate to profile page
        if (destination === "profile") {
            return navigate('/dashboard/profile');
        }
    }

    const handleNavigationClick = (destination) => {
        // navigate to home page
        if (destination === "home" || destination === "dashboard" || destination === null || destination === undefined) {
            return navigate('/dashboard');
        }
        else if (destination === "calendar") {
            return navigate('/dashboard/calendar');
        }
        else if (destination === "users") {
            return navigate('/dashboard/users');
        }
    }


    useEffect(() => {
        Axios.get('http://localhost:3001/api/get/userinfo').then((response) => {
            // if user is not logged in, redirect to login page
            if (response.data.status) {
                setUsername(response.data.user.user_name);
                setEmail(response.data.user.user_email);
                setPermissionLevel(response.data.user.user_permissions);
                setProfilePicture(response.data.user.user_avatar_url || defaultProfilePicture);

                setResponse(response);
                return;
            }

            return navigate('/');
        });

    }, []);

    useEffect(() => {
        const componentRef = componentToShow ? document.getElementById((componentToShow.type.name).toString().toLowerCase()) : document.getElementById("home");
        
        if (componentRef) {
            componentRef.classList.add('active');
        }

        return () => {
            if (componentRef) {
                componentRef.classList.remove('active');
            }
        }

    }, [componentToShow]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutsideProfileDropdown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideProfileDropdown);
        }
    }, [profileDropdownOpen]);


    // user permission levels:
    // 0 - default user - reader
    // 1 - editor
    // 2 - admin


    return (
        <div className="dashboard-container">

            <div className='dashboard-left-bar'>
                <div className='dashboard-header-title'>
                    <h1>Dashboard</h1>
                    <FaBars />
                </div>

                <div className='dashboard-left-bar-item-section'>
                    <h2>Navigation</h2>
                </div>

                {/* BAR ITEMS / SECTIONS */}
                <div className='dashboard-left-bar-item' id="home" onClick={(e) => handleNavigationClick(e.target.id)}>
                    <FaHome />
                    <p>Home</p>
                </div>

                <div className='dashboard-left-bar-item' id="calendar" onClick={(e) => handleNavigationClick(e.target.id)}>
                    <FaHome />
                    <p>Calendar</p>
                </div>


                {
                    permissionLevel >= 2 &&
                    <div className='dashboard-left-bar-item-section'>
                        <h2>Administration</h2>

                    </div>
                }

                {
                    permissionLevel >= 2 &&
                    <div className='dashboard-left-bar-item' id="users" onClick={(e) => handleNavigationClick(e.target.id)}>
                        <BiGroup />
                        <p>Users</p>
                    </div>
                }



            </div>

            <div className='dashboard-header'>

                <div className='dashboard-header-buttons'>
                    <div className='profile'>
                        <div className="small-profile-info" onClick={handleProfileDropdown}>
                            <img src={profilePicture} onError={e => {e.currentTarget.src = defaultProfilePicture;e.currentTarget.onerror=null}} alt='profile' />
                            <p>{username}</p>
                            <MdArrowDropDown />
                        </div>


                        {profileDropdownOpen &&
                            <div className='profile-dropdown'>
                                <div className='profile-dropdown-item' onClick={() => handleProfileDropdownClick("profile")}>
                                    <FaUserAlt />
                                    <p>My profile</p>
                                </div>

                                <div className="profile-dropdown-divider" />

                                <div className='profile-dropdown-item' onClick={handleLogout}>
                                    <BsBoxArrowLeft />
                                    <p>Sign Out</p>
                                </div>
                            </div>
                        }
                    </div>

                    <div className='logout' onClick={handleLogout}>
                        <BsBoxArrowLeft />
                    </div>
                </div>

            </div>

            <div className='dashboard-content'>
                {componentToShow}
            </div>

        </div>
    );

}

export default Dashboard;