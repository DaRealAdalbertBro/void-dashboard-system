// import modules
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// import icons
import { BiCog, BiGroup } from "react-icons/bi";
import { FaBars, FaHome } from "react-icons/fa";
import { BsBoxArrowLeft } from "react-icons/bs";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdArrowDropDown, MdOutlineBugReport } from "react-icons/md";

// import dashboard methods
import { defaultProfilePicture, maxPermissionLevel } from '../globalVariables';
import { handleNavigationClick, handleProfileDropdown, handleProfileDropdownItemClick, handleClickOutsideProfileDropdown, handleLogout, handleLeftSidebarToggle } from './dashboardMethods';
import { getTheme, getUserData, toggleTheme } from '../../utils/utils';

import { HiOutlineLightBulb, HiOutlineMoon } from 'react-icons/hi';

// import dashboard css
import './Dashboard.css';
import { AiFillGithub } from 'react-icons/ai';

const Dashboard = ({ componentToShow }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [permissionLevel, setPermissionLevel] = useState(0);
    const [profilePicture, setProfilePicture] = useState("");
    const [pageLoading, setPageLoading] = useState(true);

    // get user info from server
    useEffect(() => {
        // define abort controller
        const controller = new AbortController();

        // get user info from server
        getUserData(controller).then((response) => {
            // if user is logged in, set user info
            if (response.status) {
                setUsername(response.data.user.user_name);
                setEmail(response.data.user.user_email);
                setPermissionLevel(response.data.user.user_permissions);
                setProfilePicture(response.data.user.user_avatar_url || defaultProfilePicture);

                setPageLoading(false);
                return;
            }

            // if user is not logged in, redirect to login page
            return navigate('/login');
        });

        // set document title
        document.title = 'Dashboard | Void';

        // cleanup, abort fetch request
        return () => controller.abort();
    }, [navigate]);

    // handle left sidebar click
    useEffect(() => {
        // get navigation item that was clicked
        const componentRef = document.getElementById((componentToShow.type.name).toString());

        // add active class to navigation item
        if (componentRef) {
            componentRef.classList.add('active');
        }

        // remove active class from navigation item when component unmounts
        return () => {
            if (componentRef) {
                componentRef.classList.remove('active');
            }
        }
    }, [componentToShow, pageLoading]);

    return (
        <div className="dashboard-container">

            <LeftSideBar permissionLevel={permissionLevel} />

            <TopNavigationBar username={username} email={email} profilePicture={profilePicture} permissionLevel={permissionLevel} />

            <div className='dashboard-content'>
                {componentToShow}
            </div>

        </div>
    );
};

const TopNavigationBar = ({ username, email, profilePicture, permissionLevel }) => {
    const navigate = useNavigate();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(null);

    // handle profile dropdown click
    useEffect(() => {
        // check if listener should be added
        if (document.onmousedown !== null) {
            return;
        }

        document.onmousedown = (e) => handleClickOutsideProfileDropdown(e, setProfileDropdownOpen, profileDropdownOpen);

        setCurrentTheme(getTheme());

        // remove event listener when component unmounts
        return () => document.onmousedown = null;

    }, [profileDropdownOpen]);

    return (
        <nav className='dashboard-header'>

            <div className='dashboard-header-buttons'>

                {/* PROFILE DROPDOWN */}
                <div className='profile'>
                    <button className="small-profile-info" id="dropdown-title" onClick={() => handleProfileDropdown(profileDropdownOpen, setProfileDropdownOpen)}>
                        <img src={profilePicture} onError={e => { e.currentTarget.src = defaultProfilePicture; e.currentTarget.onerror = null }} alt='profile' />
                        <p>{username}</p>
                        <MdArrowDropDown />
                    </button>

                    {profileDropdownOpen &&
                        <div className='profile-dropdown'>
                            <button className='profile-dropdown-item' onClick={() => handleProfileDropdownItemClick("/dashboard/profile", setProfileDropdownOpen, navigate)}>
                                <BiCog />
                                <p>My Account</p>
                            </button>

                            <div className="profile-dropdown-divider" />

                            <div className='profile-dropdown-item-section'>Help & Support</div>

                            <button className='profile-dropdown-item' onClick={() => window.open("https://github.com/DaRealAdalbertBro/void-dashboard-system", "_blank")}>
                                <AiFillGithub />
                                <p>GitHub</p>
                            </button>

                            <button className='profile-dropdown-item' onClick={() => window.open("https://github.com/DaRealAdalbertBro/void-dashboard-system/wiki", "_blank")}>
                                <HiOutlineDocumentText />
                                <p>Documentation</p>
                            </button>

                            <button className='profile-dropdown-item' onClick={() => window.open("https://github.com/DaRealAdalbertBro/void-dashboard-system/issues/new", "_blank")}>
                                <MdOutlineBugReport />
                                <p>Report a Bug</p>
                            </button>

                            <div className="profile-dropdown-divider" />

                            <div className='profile-dropdown-item-section'>Themes</div>

                            <button className='profile-dropdown-item' onClick={() => {
                                toggleTheme();

                                setProfileDropdownOpen(false);
                            }}>
                                {currentTheme === "light" ? <HiOutlineLightBulb /> : <HiOutlineMoon />}
                                <p style={{textTransform: "capitalize"}}>{currentTheme} mode</p>
                            </button>

                            <div className="profile-dropdown-divider" />

                            <button className='profile-dropdown-item' onClick={() => handleLogout(navigate)}>
                                <BsBoxArrowLeft />
                                <p>Sign Out</p>
                            </button>
                        </div>
                    }
                </div>

                {/* LOGOUT BUTTON */}
                <div className='logout' onClick={() => handleLogout(navigate)}>
                    <BsBoxArrowLeft />
                </div>

            </div>

        </nav>
    );
};

const LeftSideBar = ({ permissionLevel }) => {
    const navigate = useNavigate();

    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

    // detect window resize
    useLayoutEffect(() => {
        function onUpdateSize() {
            // get width
            const width = window.innerWidth;
            if ((leftSidebarOpen && width < 768 && width > 700) || (!leftSidebarOpen && width > 768 && width < 836)) {
                handleLeftSidebarToggle(leftSidebarOpen, setLeftSidebarOpen);
            }
        }

        // add event listener
        window.addEventListener('resize', onUpdateSize);
        onUpdateSize();

        // remove event listener when component unmounts
        return () => window.removeEventListener('resize', onUpdateSize);
    }, [leftSidebarOpen]);

    return (
        <div className='dashboard-left-bar'>
            <div className='dashboard-header-title' onClick={() => handleLeftSidebarToggle(leftSidebarOpen, setLeftSidebarOpen)}>
                <h1>Dashboard</h1>
                <FaBars />
            </div>

            <div className='dashboard-left-bar-item-section'>
                <h2>Navigation</h2>
            </div>

            {/* BAR ITEMS / SECTIONS */}
            <button className='dashboard-left-bar-item' id="Home" onClick={() => handleNavigationClick("Home", navigate)}>
                <FaHome />
                <p>Home</p>
            </button>

            {
                permissionLevel >= maxPermissionLevel &&
                <div className='dashboard-left-bar-item-section'>
                    <h2>Administration</h2>

                </div>
            }

            {
                permissionLevel >= maxPermissionLevel &&
                <button className='dashboard-left-bar-item' id="UserManagement" onClick={(e) => handleNavigationClick("UserManagement", navigate)}>
                    <BiGroup />
                    <p>Users</p>
                </button>
            }

        </div>
    );
};


export default Dashboard;